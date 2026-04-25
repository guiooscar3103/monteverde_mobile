"""
======================================================================
ARCHIVO CENTRAL DEL BACKEND (API GATEWAY)
======================================================================
Propósito:
    Este archivo (app.py) actúa como el Servidor Principal y Controlador API Rest.
    Interconecta la aplicación React Native con la base de datos MySQL.

Relación y Arquitectura:
    - Autenticación: Genera y valida tokens JWT (JSON Web Tokens) permitiendo 
      que el frontend persista sesiones sin estado.
    - Base de Datos: Abre una conexión aislada a `monteverde_db` por cada petición.
    - Endpoints: Contiene las rutas que suplen de datos a los componentes `api.ts` 
      del lado móvil.

Decisión Arquitectónica Clave:
    Se usa un patrón de arquitectura monolítico basado en Flask para facilitar el 
    prototipado rápido y agrupar Lógica de Negocio y Data Access en una sola capa.
======================================================================
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from datetime import datetime, timedelta
import jwt

app = Flask(__name__)

# ==========================================
# CORS SIMPLE Y DIRECTO
# ==========================================
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://192.168.1.21:*", "*"],
        "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
        "allow_headers": "*"
    }
})

# ==========================================
# CONFIGURACIONES
# ==========================================
app.config['SECRET_KEY'] = 'monteverde-secret-2025'

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'monteverde_db',
    'charset': 'utf8mb4'
}

def get_db_connection():
    """Crea y retorna una conexión a MySQL."""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except mysql.connector.Error as err:
        print(f"❌ Error BD: {err}")
        return None

# =====================================================
# RUTAS BÁSICAS / SALUD
# =====================================================

@app.route('/', methods=['GET'])
def index():
    """Ruta raíz para evitar error 404 al entrar a la IP base."""
    return jsonify({
        'status': 'OK',
        'message': 'Bienvenido a la API de MonteVerde',
        'endpoints_disponibles': ['/health', '/api/test-db', '/api/cursos', '...']
    })

@app.route('/health', methods=['GET'])
def health():
    """Salud del servicio."""
    return jsonify({
        'status': 'OK',
        'message': 'API funcionando',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/test-db', methods=['GET'])
def test_db():
    """Verificación rápida de conexión y una muestra de usuarios."""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'No conexión BD'}), 500

        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM usuarios")
        count = cursor.fetchone()[0]

        cursor.execute("SELECT email, rol FROM usuarios LIMIT 3")
        users = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'usuarios_count': count,
            'sample_users': [{'email': u[0], 'rol': u[1]} for u in users]
        })

    except Exception as e:
        print(f"❌ Error test-db: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

# =====================================================
# AUTENTICACIÓN
# =====================================================

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login simple (comparación directa de password por ahora)."""
    try:
        print("🔐 Login request recibido")

        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data'}), 400

        email = data.get('email')
        password = data.get('password')

        print(f"📧 Email: {email}")
        print(f"🔑 Password: {password}")

        if not email or not password:
            return jsonify({'success': False, 'message': 'Email y password requeridos'}), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Error BD'}), 500

        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM usuarios WHERE email = %s", (email,))
        user = cursor.fetchone()

        print(f"👤 Usuario encontrado: {user}")

        if not user:
            cursor.close()
            conn.close()
            return jsonify({'success': False, 'message': 'Usuario no encontrado'}), 401

        # ⚠️ Password simple por ahora (pendiente: hashing con bcrypt/werkzeug)
        if str(user['password']) == str(password):
            user_data = {
                'id': user['id'],
                'nombre': user['nombre'],
                'email': user['email'],
                'rol': user['rol']
            }

            token = jwt.encode({
                'user_id': user['id'],
                'email': user['email'],
                'rol': user['rol'],
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, app.config['SECRET_KEY'], algorithm='HS256')

            if isinstance(token, bytes):
                token = token.decode('utf-8')

            cursor.close()
            conn.close()

            print("✅ Login exitoso")

            return jsonify({
                'success': True,
                'message': 'Login exitoso',
                'user': user_data,
                'token': token
            })
        else:
            cursor.close()
            conn.close()
            return jsonify({'success': False, 'message': 'Password incorrecto'}), 401

    except Exception as e:
        print(f"❌ Error login: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

# =====================================================
# CURSOS
# =====================================================

@app.route('/api/cursos', methods=['GET'])
def get_cursos():
    """Obtener todos los cursos con total de estudiantes."""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Error BD'}), 500

        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                c.id,
                c.nombre,
                c.nivel,
                c.letra,
                COUNT(e.id) AS total_estudiantes
            FROM cursos c
            LEFT JOIN estudiantes e ON c.id = e.curso_id
            GROUP BY c.id, c.nombre, c.nivel, c.letra
            ORDER BY c.nivel, c.letra
        """)
        cursos = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({'success': True, 'data': cursos})

    except Exception as e:
        print(f"❌ Error cursos: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

# =====================================================
# DASHBOARD DOCENTE
# =====================================================

@app.route('/api/docente/dashboard/<int:docente_id>', methods=['GET'])
def get_docente_dashboard(docente_id):
    """Obtener información del dashboard del docente."""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Error BD'}), 500

        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                c.id,
                c.nombre,
                c.nivel,
                c.letra,
                COUNT(e.id) AS total_estudiantes
            FROM cursos c
            LEFT JOIN estudiantes e ON c.id = e.curso_id
            GROUP BY c.id, c.nombre, c.nivel, c.letra
            ORDER BY c.nivel, c.letra
            LIMIT 5
        """)
        cursos = cursor.fetchall()

        cursor.execute("""
            SELECT 
                m.id,
                m.asunto,
                m.cuerpo,
                m.fecha AS fecha,
                u.nombre AS emisor
            FROM mensajes m
            JOIN usuarios u ON m.emisor_id = u.id
            WHERE m.receptor_id = %s AND m.leido = 0
            ORDER BY m.fecha DESC
            LIMIT 3
        """, (docente_id,))
        mensajes = cursor.fetchall()
        for msg in mensajes:
            if 'fecha' in msg and hasattr(msg['fecha'], 'isoformat'):
                msg['fecha'] = msg['fecha'].isoformat()

        cursor.close()
        conn.close()

        tareas_pendientes = [
            {'tipo': 'asistencia', 'curso': '7°B', 'descripcion': 'Registrar asistencia', 'urgencia': 'hoy'},
            {'tipo': 'calificaciones', 'curso': '8°A', 'descripcion': 'Calificar tareas de Matemáticas', 'urgencia': 'vence hoy'},
            {'tipo': 'boletines', 'curso': 'Todos', 'descripcion': 'Enviar boletines 2025-P2', 'urgencia': 'próximamente'}
        ]

        payload = {
            'cursos': cursos,
            'mensajes_pendientes': mensajes,
            'tareas_pendientes': tareas_pendientes,
            'estadisticas': {
                'total_cursos': len(cursos),
                'mensajes_no_leidos': len(mensajes),
                'estudiantes_total': sum(c['total_estudiantes'] for c in cursos) if cursos else 0
            }
        }

        return jsonify({'success': True, 'data': payload})

    except Exception as e:
        print(f"❌ Error dashboard docente: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

# =====================================================
# NUEVOS ENDPOINTS: MENSAJES Y ESTUDIANTES
# =====================================================

@app.route('/api/mensajes/<int:usuario_id>', methods=['GET'])
def get_mensajes(usuario_id):
    """Obtener mensajes de un usuario (entrantes y salientes)"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Error BD'}), 500

        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                m.id,
                m.emisor_id,
                m.receptor_id,
                m.asunto,
                m.cuerpo,
                m.leido,
                m.fecha AS fecha,
                emisor.nombre   AS emisor_nombre,
                receptor.nombre AS receptor_nombre
            FROM mensajes m
            JOIN usuarios emisor   ON m.emisor_id = emisor.id
            JOIN usuarios receptor ON m.receptor_id = receptor.id
            WHERE m.receptor_id = %s OR m.emisor_id = %s
            ORDER BY m.fecha DESC
        """, (usuario_id, usuario_id))
        mensajes = cursor.fetchall()
        for msg in mensajes:
            if 'fecha' in msg and hasattr(msg['fecha'], 'isoformat'):
                msg['fecha'] = msg['fecha'].isoformat()
        
        cursor.close()
        conn.close()

        return jsonify({'success': True, 'data': mensajes})

    except Exception as e:
        print(f"❌ Error get_mensajes: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/estudiantes', methods=['GET'])
def get_estudiantes():
    """Obtener estudiantes con filtros opcionales (curso_id)."""
    try:
        curso_id = request.args.get('curso_id')

        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Error BD'}), 500

        cursor = conn.cursor(dictionary=True)

        if curso_id:
            cursor.execute("""
                SELECT 
                    e.id, e.nombre, e.apellido, e.documento, e.curso_id,
                    c.nombre AS curso_nombre, c.nivel, c.letra
                FROM estudiantes e
                JOIN cursos c ON e.curso_id = c.id
                WHERE e.curso_id = %s
                ORDER BY e.nombre
            """, (curso_id,))
        else:
            cursor.execute("""
                SELECT 
                    e.id, e.nombre, e.apellido, e.documento, e.curso_id,
                    c.nombre AS curso_nombre, c.nivel, c.letra
                FROM estudiantes e
                JOIN cursos c ON e.curso_id = c.id
                ORDER BY c.nivel, c.letra, e.nombre
            """)

        estudiantes = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify({'success': True, 'data': estudiantes})

    except Exception as e:
        print(f"❌ Error get_estudiantes: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

# =====================================================
# NUEVOS ENDPOINTS: CALIFICACIONES
# =====================================================

@app.route('/api/estudiantes/por-curso/<int:curso_id>', methods=['GET'])
def get_estudiantes_por_curso(curso_id):
    """Obtener estudiantes de un curso específico"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Error BD'}), 500

        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                e.id, e.nombre, e.curso_id,
                c.nombre AS curso_nombre, c.nivel, c.letra
            FROM estudiantes e
            JOIN cursos c ON e.curso_id = c.id
            WHERE e.curso_id = %s
            ORDER BY e.nombre
        """, (curso_id,))
        estudiantes = cursor.fetchall()
        conn.close()

        return jsonify({'success': True, 'data': estudiantes})

    except Exception as e:
        print(f"❌ Error estudiantes por curso: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/calificaciones/buscar', methods=['GET'])
def get_calificaciones_por():
    """Buscar calificaciones por curso, asignatura y periodo"""
    try:
        curso_id = request.args.get('cursoId')
        asignatura = request.args.get('asignatura')
        periodo = request.args.get('periodo')

        print(f"🔍 Buscando calificaciones: curso={curso_id}, asignatura={asignatura}, periodo={periodo}")

        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Error BD'}), 500

        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT 
                c.id, c.estudiante_id, c.asignatura, c.periodo, c.nota, c.fecha_registro,
                e.nombre AS estudiante_nombre
            FROM calificaciones c
            JOIN estudiantes e ON c.estudiante_id = e.id
            WHERE 1=1
        """
        params = []

        if curso_id:
            query += " AND e.curso_id = %s"
            params.append(curso_id)

        if asignatura:
            query += " AND c.asignatura = %s"
            params.append(asignatura)

        if periodo:
            query += " AND c.periodo = %s"
            params.append(periodo)

        query += " ORDER BY e.nombre"

        cursor.execute(query, params)
        calificaciones = cursor.fetchall()
        print(f"📊 Calificaciones encontradas: {len(calificaciones)}")
        conn.close()

        return jsonify({'success': True, 'data': calificaciones})

    except Exception as e:
        print(f"❌ Error buscar calificaciones: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/calificaciones/guardar', methods=['POST'])
def guardar_calificaciones():
    """Guardar o actualizar calificaciones"""
    try:
        data = request.get_json()
        calificaciones = data.get('calificaciones', [])

        if not calificaciones:
            return jsonify({'success': False, 'message': 'No hay calificaciones para guardar'}), 400

        print(f"💾 Guardando {len(calificaciones)} calificaciones")

        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Error BD'}), 500

        cursor = conn.cursor()

        for calif in calificaciones:
            estudiante_id = calif.get('estudianteId')
            asignatura = calif.get('asignatura')
            periodo = calif.get('periodo')
            nota = calif.get('nota')

            cursor.execute("""
                SELECT id FROM calificaciones 
                WHERE estudiante_id = %s AND asignatura = %s AND periodo = %s
            """, (estudiante_id, asignatura, periodo))
            existing = cursor.fetchone()

            if existing:
                cursor.execute("""
                    UPDATE calificaciones 
                    SET nota = %s, fecha_registro = CURDATE()
                    WHERE estudiante_id = %s AND asignatura = %s AND periodo = %s
                """, (nota, estudiante_id, asignatura, periodo))
                print(f"📝 Actualizada calificación para estudiante {estudiante_id}")
            else:
                cursor.execute("""
                    INSERT INTO calificaciones (estudiante_id, asignatura, periodo, nota, fecha_registro)
                    VALUES (%s, %s, %s, %s, CURDATE())
                """, (estudiante_id, asignatura, periodo, nota))
                print(f"✅ Nueva calificación para estudiante {estudiante_id}")

        conn.commit()
        conn.close()

        return jsonify({
            'success': True,
            'message': f'Se guardaron {len(calificaciones)} calificaciones correctamente'
        })

    except Exception as e:
        print(f"❌ Error guardar calificaciones: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

# =====================================================
# RUTAS MOCK PARA ASISTENCIA Y OBSERVACIONES
# =====================================================

@app.route('/api/asistencia/por-fecha', methods=['GET'])
def get_asistencia_por_fecha():
    return jsonify({'success': True, 'data': []})

@app.route('/api/asistencia/guardar', methods=['POST'])
def guardar_asistencia():
    return jsonify({'success': True, 'message': 'Asistencia guardada (Mock)'})

@app.route('/api/asistencia/estadisticas', methods=['GET'])
def estadisticas_asistencia():
    return jsonify({
        'success': True, 
        'data': {
            'registrados': 0, 
            'total_estudiantes': 0, 
            'pendientes': 0, 
            'por_estado': {'PRESENTE': 0, 'AUSENTE': 0, 'TARDE': 0, 'JUSTIFICADO': 0}
        }
    })

@app.route('/api/observaciones/por-curso/<int:curso_id>', methods=['GET'])
def observaciones_por_curso(curso_id):
    return jsonify({'success': True, 'data': []})

@app.route('/api/observaciones/agregar', methods=['POST'])
def agregar_observacion():
    return jsonify({'success': True, 'data': {'id': 999, 'mensaje': 'Anotación creada (Mock)'}})

@app.route('/api/conversacion/<int:u1>/<int:u2>', methods=['GET'])
def get_conversacion(u1, u2):
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Error BD'}), 500

        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
                m.id, m.emisor_id, m.receptor_id, m.asunto, m.cuerpo, m.leido,
                m.fecha AS fecha
            FROM mensajes m
            WHERE (m.emisor_id = %s AND m.receptor_id = %s)
               OR (m.emisor_id = %s AND m.receptor_id = %s)
            ORDER BY m.fecha ASC
        """, (u1, u2, u2, u1))
        mensajes = cursor.fetchall()
        for msg in mensajes:
            if 'fecha' in msg and hasattr(msg['fecha'], 'isoformat'):
                msg['fecha'] = msg['fecha'].isoformat()
        cursor.close()
        conn.close()

        return jsonify({'success': True, 'data': mensajes})
    except Exception as e:
        print(f"❌ Error get_conversacion: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/mensajes/enviar', methods=['POST'])
def enviar_mensaje():
    try:
        data = request.json
        emisor_id = data.get('emisorId')
        receptor_id = data.get('receptorId')
        asunto = data.get('asunto')
        cuerpo = data.get('cuerpo')

        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Error BD'}), 500

        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO mensajes (emisor_id, receptor_id, asunto, cuerpo, leido, fecha)
            VALUES (%s, %s, %s, %s, 0, NOW())
        """, (emisor_id, receptor_id, asunto, cuerpo))
        msg_id = cursor.lastrowid
        conn.commit()
        
        cursor.close()
        conn.close()

        return jsonify({'success': True, 'data': {
            'id': msg_id, 'emisor_id': emisor_id, 'receptor_id': receptor_id,
            'asunto': asunto, 'cuerpo': cuerpo, 'leido': 0, 'fecha': datetime.now().isoformat()
        }})
    except Exception as e:
        print(f"❌ Error enviar_mensaje: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/mensajes/marcar-leido/<int:mensaje_id>', methods=['PUT'])
def marcar_leido(mensaje_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE mensajes SET leido = 1 WHERE id = %s", (mensaje_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/usuarios/familia', methods=['GET'])
def get_familias():
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Error BD'}), 500

        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, nombre, email, estudiante_id
            FROM usuarios
            WHERE rol = 'familia'
            ORDER BY nombre ASC
        """)
        familias = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify({'success': True, 'data': familias})

    except Exception as e:
        print(f"❌ Error get_familias: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/usuarios/docentes', methods=['GET'])
def get_docentes():
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Error BD'}), 500

        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, nombre, email
            FROM usuarios
            WHERE rol = 'docente'
            ORDER BY nombre ASC
        """)
        docentes = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify({'success': True, 'data': docentes})

    except Exception as e:
        print(f"❌ Error get_docentes: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

# =====================================================
# MAIN
# =====================================================

if __name__ == '__main__':
    print("🚀 MonteVerde API iniciando...")
    print("🌐 http://192.168.1.21:5000")
    print("🔗 CORS permitido para localhost y 192.168.1.21")
    app.run(debug=True, port=5000, host='192.168.1.21')
