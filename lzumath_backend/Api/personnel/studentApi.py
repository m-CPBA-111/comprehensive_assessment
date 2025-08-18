import pymysql
import logging
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

studentApi = Blueprint('student', __name__, url_prefix='/api/student')

# 数据库配置
db_config = {
    'host': 'my_mysql',
    'user': 'root',
    'password': '123456',
    'database': 'lzumathedu',
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}

# 文件上传配置
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file):
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        return file_path
    return None

# 登录接口
@studentApi.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    student_id = data.get('studentId')
    password = data.get('password')
    logger.info(f"登录请求 - 学号: {student_id}")
    ret = {'success': False, 'msg': '参数错误'}
    
    if not student_id or not password:
        logger.warning(f"登录失败 - 学号或密码为空，学号: {student_id}")
        return ret
        
    conn = None
    try:
        conn = pymysql.connect(**db_config)
        with conn.cursor() as cs:
            # 新增查询学院信息
            sql = """
                SELECT id, password, isFirstLogin, name, class, college 
                FROM Students 
                WHERE id = %s AND password = %s
            """
            cs.execute(sql, (student_id, password))
            student = cs.fetchone()
            
            if student:
                ret.update({
                    'success': True,
                    'isFirstLogin': bool(student.get('isFirstLogin', 1)),
                    'msg': '登录成功',
                    'name': student.get('name'),
                    'class': student.get('class'),
                    'college': student.get('college')  # 返回学院信息
                })
                logger.info(f"登录成功 - 学号: {student_id}, 班级: {student.get('class')}")
            else:
                ret['msg'] = '校园卡号或密码错误'
                logger.warning(f"登录失败 - 账号密码错误，学号: {student_id}")
    except Exception as e:
        ret['msg'] = f'数据库错误: {str(e)}'
        logger.error(f"登录数据库错误 - 学号: {student_id}, 错误: {str(e)}", exc_info=True)
    finally:
        if conn:
            conn.close()
    return ret

# 获取综测数据接口
@studentApi.route('/info', methods=['GET'])
def get_student_info():
    student_id = request.args.get('studentId')
    if not student_id:
        return jsonify({'success': False, 'msg': '学号不能为空'})
    
    conn = None
    try:
        conn = pymysql.connect(** db_config)
        with conn.cursor() as cs:
            # 获取学生基本信息（新增学院字段）
            cs.execute("""
                SELECT id, name, class, grade, college, total_score, rank 
                FROM Students 
                WHERE id = %s
            """, (student_id,))
            student_info = cs.fetchone()
            
            if not student_info:
                return jsonify({'success': False, 'msg': '学生信息不存在'})
            
            # 获取教师评价（新增comment字段）
            cs.execute("""
                SELECT item, score, comment, status 
                FROM TeacherScores 
                WHERE student_id = %s AND status = 'published'
            """, (student_id,))
            teacher_scores = cs.fetchall()
            teacher_status = 'published' if teacher_scores else 'unpublished'
            
            # 获取基本素质评分
            cs.execute("""
                SELECT item, score, status 
                FROM QualityScores 
                WHERE student_id = %s AND status = 'published'
            """, (student_id,))
            quality_scores = cs.fetchall()
            quality_status = 'published' if quality_scores else 'unpublished'
            
            # 获取学习成绩（新增课程性质和学期）
            cs.execute("""
                SELECT course, course_type, score, semester, credit 
                FROM StudyScores 
                WHERE student_id = %s
            """, (student_id,))
            study_scores = cs.fetchall()
            
            # 计算GPA和加权平均分
            total_credit = sum(s['credit'] for s in study_scores) or 1
            weighted_sum = sum(s['score'] * s['credit'] for s in study_scores)
            weighted_avg = weighted_sum / total_credit
            gpa = weighted_avg / 20  # 简单转换，实际应根据学校规则
            
            # 获取二课积分
            cs.execute("""
                SELECT score 
                FROM SecondClassScores 
                WHERE student_id = %s
            """, (student_id,))
            second_class = cs.fetchone()
            second_class_score = second_class['score'] if second_class else 0
            
            # 获取扣除分
            cs.execute("""
                SELECT reason, score, status 
                FROM DeductionScores 
                WHERE student_id = %s AND status = 'published'
            """, (student_id,))
            deduction_items = cs.fetchall()
            deduction_status = 'published' if deduction_items else 'unpublished'
            
            # 获取附加分
            cs.execute("""
                SELECT name, score, file_url, status 
                FROM ExtraScores 
                WHERE student_id = %s AND status = 'published'
            """, (student_id,))
            extra_scores = cs.fetchall()
            extra_status = 'published' if extra_scores else 'unpublished'
            
            # 构建返回数据
            result = {
                'success': True,
                'data': {
                    'studentInfo': {
                        'name': student_info['name'],
                        'studentId': student_info['id'],
                        'class': student_info['class'],
                        'grade': student_info['grade'],
                        'college': student_info['college']  # 新增学院信息
                    },
                    'totalScore': student_info['total_score'],
                    'rank': student_info['rank'],
                    'teacherScores': teacher_scores,
                    'teacherStatus': teacher_status,
                    'teacherRatio': '20%',
                    'qualityScores': quality_scores,
                    'qualityStatus': quality_status,
                    'qualityRatio': '20%',
                    'studyScores': study_scores,
                    'studyRatio': '40%',
                    'gpa': round(gpa, 2),
                    'weightedAvg': round(weighted_avg, 2),
                    'secondClassScore': second_class_score,
                    'secondClassRatio': '10%',
                    'deductionItems': deduction_items,
                    'deductionStatus': deduction_status,
                    'deductionRatio': '10%',
                    'extraScores': extra_scores,
                    'extraStatus': extra_status,
                    'extraRatio': '10%'
                }
            }
            return jsonify(result)
            
    except Exception as e:
        logger.error(f"获取学生信息错误: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'msg': '服务器错误'})
    finally:
        if conn:
            conn.close()

# 修改密码接口
@studentApi.route('/change-password', methods=['POST'])
def change_password():
    data = request.get_json()
    student_id = data.get('studentId')
    old_password = data.get('oldPassword')
    new_password = data.get('newPassword')
    
    logger.info(f"修改密码请求 - 学号: {student_id}")
    ret = {'success': False, 'msg': '参数错误'}
    if not all([student_id, old_password, new_password]):
        logger.warning(f"修改密码失败 - 参数不完整，学号: {student_id}")
        return ret
    
    if len(new_password) < 6:
        ret['msg'] = '新密码长度不能少于6位'
        logger.warning(f"修改密码失败 - 新密码过短，学号: {student_id}")
        return ret
    conn = None
    try:
        conn = pymysql.connect(**db_config)
        with conn.cursor() as cs:
            # 验证原密码
            sql = "SELECT id, class FROM Students WHERE id = %s AND password = %s"
            cs.execute(sql, (student_id, old_password))
            student = cs.fetchone()
            
            if not student:
                ret['msg'] = '原密码错误'
                logger.warning(f"修改密码失败 - 原密码错误，学号: {student_id}")
                return ret
            
            # 更新密码
            update_sql = """
                UPDATE Students 
                SET password = %s, isFirstLogin = 0 
                WHERE id = %s
            """
            rows_affected = cs.execute(update_sql, (new_password, student_id))
            conn.commit()
            
            if rows_affected > 0:
                ret.update({
                    'success': True,
                    'msg': '密码修改成功',
                    'class': student.get('class')
                })
                logger.info(f"修改密码成功 - 学号: {student_id}, 班级: {student.get('class')}")
            else:
                ret['msg'] = '密码修改失败，请重试'
                logger.warning(f"修改密码失败 - 无记录更新，学号: {student_id}")
                
    except Exception as e:
        if conn:
            conn.rollback()
        ret['msg'] = f'数据库错误: {str(e)}'
        logger.error(f"修改密码数据库错误 - 学号: {student_id}, 错误: {str(e)}", exc_info=True)
    finally:
        if conn:
            conn.close()
    return ret

# 附加分提交接口
@studentApi.route('/extra', methods=['POST'])
def submit_extra_score():
    try:
        student_id = request.form.get('studentId')
        name = request.form.get('name')
        score = request.form.get('score')
        file = request.files.get('file')
        
        if not all([student_id, name, score]):
            return jsonify({'success': False, 'msg': '参数不完整'})
        
        try:
            score = float(score)
        except ValueError:
            return jsonify({'success': False, 'msg': '分值必须是数字'})
            
        file_url = None
        if file:
            file_path = save_uploaded_file(file)
            if file_path:
                file_url = f'/{file_path}'
        
        conn = None
        try:
            conn = pymysql.connect(** db_config)
            with conn.cursor() as cs:
                sql = """
                    INSERT INTO ExtraScores 
                    (student_id, name, score, file_url, status) 
                    VALUES (%s, %s, %s, %s, 'unpublished')
                """
                cs.execute(sql, (student_id, name, score, file_url))
                conn.commit()
                
                return jsonify({
                    'success': True,
                    'msg': '附加分提交成功，等待审核'
                })
        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"附加分提交错误: {str(e)}", exc_info=True)
            return jsonify({'success': False, 'msg': '数据库错误'})
        finally:
            if conn:
                conn.close()
    except Exception as e:
        logger.error(f"附加分处理错误: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'msg': '服务器错误'})

# 批量提交附加分接口
@studentApi.route('/submit-all-extra', methods=['POST'])
def submit_all_extra_scores():
    try:
        student_id = request.form.get('studentId')
        if not student_id:
            return jsonify({'success': False, 'msg': '学号不能为空'})

        # 获取所有项目数量
        items_count = 0
        while f'items[{items_count}][name]' in request.form:
            items_count += 1

        if items_count == 0:
            return jsonify({'success': False, 'msg': '没有需要提交的附加分项目'})

        conn = None
        try:
            conn = pymysql.connect(**db_config)
            with conn.cursor() as cs:
                # 准备SQL语句
                sql = """
                    INSERT INTO ExtraScores 
                    (student_id, name, score, file_url, status) 
                    VALUES (%s, %s, %s, %s, 'unpublished')
                """
                
                # 处理每个项目
                for i in range(items_count):
                    name = request.form.get(f'items[{i}][name]')
                    score_str = request.form.get(f'items[{i}][score]')
                    file = request.files.get(f'files[{i}]')

                    if not all([name, score_str]):
                        conn.rollback()
                        return jsonify({'success': False, 'msg': f'第{i+1}项参数不完整'})

                    try:
                        score = float(score_str)
                    except ValueError:
                        conn.rollback()
                        return jsonify({'success': False, 'msg': f'第{i+1}项分值必须是数字'})

                    # 保存文件
                    file_url = None
                    if file and file.filename:
                        file_path = save_uploaded_file(file)
                        if file_path:
                            file_url = f'/{file_path}'

                    # 执行插入
                    cs.execute(sql, (student_id, name, score, file_url))

                conn.commit()
                return jsonify({
                    'success': True,
                    'msg': f'成功提交{items_count}项附加分，等待审核'
                })

        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"批量附加分提交错误: {str(e)}", exc_info=True)
            return jsonify({'success': False, 'msg': '数据库错误'})
        finally:
            if conn:
                conn.close()

    except Exception as e:
        logger.error(f"批量附加分处理错误: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'msg': '服务器错误'})

# 申诉提交接口
@studentApi.route('/appeal', methods=['POST'])
def submit_appeal():
    try:
        student_id = request.form.get('studentId')
        item = request.form.get('item')
        reason = request.form.get('reason')
        file = request.files.get('file')
        
        if not all([student_id, item, reason]):
            return jsonify({'success': False, 'msg': '参数不完整'})
            
        file_url = None
        if file:
            file_path = save_uploaded_file(file)
            if file_path:
                file_url = f'/{file_path}'
        
        conn = None
        try:
            conn = pymysql.connect(** db_config)
            with conn.cursor() as cs:
                sql = """
                    INSERT INTO Appeals 
                    (student_id, item, reason, file_url, status) 
                    VALUES (%s, %s, %s, %s, 'pending')
                """
                cs.execute(sql, (student_id, item, reason, file_url))
                conn.commit()
                
                return jsonify({
                    'success': True,
                    'msg': '申诉提交成功，等待审核'
                })
        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"申诉提交错误: {str(e)}", exc_info=True)
            return jsonify({'success': False, 'msg': '数据库错误'})
        finally:
            if conn:
                conn.close()
    except Exception as e:
        logger.error(f"申诉处理错误: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'msg': '服务器错误'})

# 获取申诉记录接口
@studentApi.route('/appeals', methods=['GET'])
def get_appeals():
    student_id = request.args.get('studentId')
    if not student_id:
        return jsonify({'success': False, 'msg': '学号不能为空'})
    
    conn = None
    try:
        conn = pymysql.connect(**db_config)
        with conn.cursor() as cs:
            cs.execute("""
                SELECT id, item, reason, file_url, status, created_at 
                FROM Appeals 
                WHERE student_id = %s 
                ORDER BY created_at DESC
            """, (student_id,))
            appeals = cs.fetchall()
            
            return jsonify({
                'success': True,
                'data': appeals
            })
    except Exception as e:
        logger.error(f"获取申诉记录错误: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'msg': '服务器错误'})
    finally:
        if conn:
            conn.close()