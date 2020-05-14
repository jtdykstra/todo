import os

from flask import (Flask, request, make_response)
from src.db import get_db
import time
import json

# TODO: Understand CORs properly
# TODO: Set up hooks to fire at the specified time
# TODO: Generate the text messages somehow!
# TODO: Security ;)?

def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        DEBUG=True,
        DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    from . import db
    db.init_app(app)

    @app.route('/reminders')
    def get_current_time():
        return {'time': time.time()}

    @app.route('/reminder', methods=('GET', 'POST', 'OPTIONS'))
    def reminder():
        db = get_db()

        if (request.method == 'OPTIONS'):
            response = make_response()
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Headers"] = "Accept, Content-Type"
            return response
            
        if (request.method == "POST"):
            content = request.get_json()
            reminder = content["reminder"]
            unixTime = content['unixTime']
            
            error = False

            print(reminder)
            print(unixTime)
            
            db.execute(
                'INSERT INTO reminders (reminder, unixTime) VALUES (?, ?)',
                (reminder, int(unixTime))
            )
            db.commit()
            response = make_response()
            response.headers["Access-Control-Allow-Origin"] = "*"
            return response
        elif (request.method == "GET"):
            rows = db.execute('SELECT * FROM reminders').fetchall()
            response = make_response(json.dumps([dict(x) for x in rows]))
            response.headers["Access-Control-Allow-Origin"] = "*"
            return response

        return "<div>Error</>"

    @app.route('/delete', methods=('GET', 'POST', 'OPTIONS'))
    def delete():
        if (request.method == "POST"):
            db = get_db()
            content = request.get_json()
            idToDelete = content["delete"]
            print(request)
            db.execute(
                    'DELETE FROM reminders WHERE id = (?)',(idToDelete,)
                )
            db.commit()
        
        response = make_response()
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Accept, Content-Type"
        return response

    return app