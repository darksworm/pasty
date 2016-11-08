from flask import Flask, request, render_template
from flask import json
from flask import send_from_directory
from werkzeug.exceptions import NotFound

from lib.envy.envy import Envy
from lib.hydra.hydra import Hydra

app = Flask(__name__)

Envy.set_db_connection_args((
    Envy.get('MYSQL_DATABASE_HOST'),
    Envy.get('MYSQL_DATABASE_USER'),
    Envy.get('MYSQL_DATABASE_PASSWORD'),
    Envy.get('MYSQL_DATABASE_DB')
))


@app.route('/lib/<path:filename>')
def lib(filename: str):
    if filename.endswith('.css') or filename.endswith('.js'):
        return send_from_directory('lib/', filename)
    else:
        raise NotFound()


@app.route('/')
def front_page():
    return render_template('index.html')


@app.route('/add', methods=['POST'])
def add():
    result = {
        'error': None,
        'success': False,
        'id': None
    }

    try:
        text = request.get_json()['text']
    except KeyError:
        result['error'] = "No text specified!"
        return json.dumps(result), 400

    try:
        language = request.get_json()['language']
    except KeyError:
        result['error'] = "Invalid syntax highlighting specified!"
        return json.dumps(result), 400

    conn = Envy.get_db()
    Envy.query('''INSERT INTO pastes(text, language) VALUES(%s, %s)''', [text, language])
    idx = Hydra.dehydrate(conn.insert_id())
    conn.commit()

    result['success'] = True
    result['id'] = idx
    result['url'] = request.host_url + 'v/' + idx

    return json.dumps(result), 200


@app.route('/v/<url_id>')
@app.route('/r/<url_id>')
def view(url_id):
    try:
        result = get_paste(url_id)
    except ValueError:
        return 'Invalid parameters'

    if result is not None:
        return render_template('view.html', text=result[0],
                               raw=str(request.url_rule) == '/r/<url_id>',
                               raw_url=request.host_url + 'r/' + url_id,
                               language=result[2])
    else:
        return 'Paste not found', 404


def get_paste(idx):
    db_id = Hydra.hydrate(idx)
    cur = Envy.query('''SELECT text, date_created, language FROM pastes WHERE id =%s''', [db_id])
    return cur.fetchone()


if __name__ == '__main__':
    app.run(port=Envy.get('LISTEN_PORT'))
