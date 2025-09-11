from flask import Flask
from flask_cors import CORS

from Api.personnel import studentApi
from Api.personnel import classApi  # 导入新的 classApi
from Api.personnel import groupApi
from Api.personnel import downApi
from Api.personnel import showresultApi

app = Flask(__name__)
CORS(app, resources={r'/*':{"origins":["http://localhost:3000","http://127.0.0.1:3000"]}}, supports_credentials=True)
app.secret_key = '@KJHKJDSH&@^&!@###ULANEDU'


app.register_blueprint(studentApi.student)
app.register_blueprint(studentApi.groupmember)
app.register_blueprint(studentApi.teacher)

app.register_blueprint(classApi.class_info)  
app.register_blueprint(classApi.importScores)  

app.register_blueprint(groupApi.groupmemberEdit) 
app.register_blueprint(groupApi.groupmemberData)
app.register_blueprint(groupApi.studentQuery)

app.register_blueprint(downApi.templateDownload)

app.register_blueprint(showresultApi.showresult)


# @app.before_request
# def beforeRequest():
#     headers = request.headers
#     print(request.url_rule)
#     print(headers)
#     return "401", 401

@app.route("/")
def hello():
    return "Hello World!"

if __name__ == '__main__':
    # app.run(debug=True)
    app.run(host='0.0.0.0', port=5000)
    # app.run(host='172.27.0.16')
