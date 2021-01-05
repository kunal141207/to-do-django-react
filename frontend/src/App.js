import React from 'react';
import './App.css';
import ReactInputSelect from 'react-input-select';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      todoList: [],
      buckets: [],
      activeItem: {
        id: null,
        title: '',
        bucket: '',
        completed: false,
      },
      editing: false,
    }
    this.fetchTasks = this.fetchTasks.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleChangeBucket = this.handleChangeBucket.bind(this)
    this.handleClickBucket = this.handleClickBucket.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.getCookie = this.getCookie.bind(this)


    this.startEdit = this.startEdit.bind(this)
    this.deleteItem = this.deleteItem.bind(this)
    this.strikeUnstrike = this.strikeUnstrike.bind(this)
  };

  getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  componentWillMount() {
    this.fetchTasks()
  }

  fetchTasks() {
    console.log('Fetching...')

    fetch('http://127.0.0.1:8000/api/task-list/')
      .then(response => response.json())
      .then(data =>
        this.setState({
          todoList: data,
          buckets: [...new Set(data.map(data => data.bucket))]
        })
      )
  }

  handleChange(e) {
    var name = e.target.name
    var value = e.target.value
    console.log('Name:', name)
    console.log('Value:', value)

    this.setState({
      activeItem: {
        ...this.state.activeItem,
        title: value
      }
    })
  }
  handleChangeBucket(e) {
    console.log(e)
    var name = e.target.name
    var value = e.target.value
    console.log('Name:', name)
    console.log('Value:', value)

    this.setState({
      activeItem: {
        ...this.state.activeItem,
        bucket: value
      }
    })
  }

  handleClickBucket(e) {
    var value = e

    this.setState({
      activeItem: {
        ...this.state.activeItem,
        bucket: value
      }
    })
  }

  handleSubmit(e) {
    e.preventDefault()
    console.log('ITEM:', this.state.activeItem)

    var csrftoken = this.getCookie('csrftoken')

    var url = 'http://127.0.0.1:8000/api/task-create/'

    if (this.state.editing === true) {
      url = `http://127.0.0.1:8000/api/task-update/${this.state.activeItem.id}/`
      this.setState({
        editing: false
      })
    }



    fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      body: JSON.stringify(this.state.activeItem)
    }).then((response) => {
      this.fetchTasks()
      this.setState({
        activeItem: {
          id: null,
          title: '',
          bucket: '',
          completed: false,
        }
      })
    }).catch(function (error) {
      console.log('ERROR:', error)
    })

  }

  startEdit(task) {
    this.setState({
      activeItem: task,
      editing: true,
    })
  }


  deleteItem(task) {
    var csrftoken = this.getCookie('csrftoken')

    fetch(`http://127.0.0.1:8000/api/task-delete/${task.id}/`, {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
    }).then((response) => {

      this.fetchTasks()
    })
  }


  strikeUnstrike(task) {

    task.completed = !task.completed
    var csrftoken = this.getCookie('csrftoken')
    var url = `http://127.0.0.1:8000/api/task-update/${task.id}/`

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      body: JSON.stringify({ 'completed': task.completed, 'title': task.title, 'bucket': task.bucket })
    }).then(() => {
      this.fetchTasks()
    })

    console.log('TASK:', task.completed)
  }


  render() {
    var tasks = this.state.todoList
    var self = this
    return (
      <div className="container">

        <div id="task-container">
          <div id="form-wrapper">
            <form onSubmit={this.handleSubmit} id="form">
              <div className="flex-wrapper">
                <div>
                  <label for="title">Task name</label>
                  <input onChange={this.handleChange}
                    className="form-control"
                    id="title"
                    value={this.state.activeItem.title}
                    type="text"
                    name="title"
                    placeholder="Add task.." />
                </div>
                <div>
                  <label for="bucket">Bucket name</label>
                  <ReactInputSelect
                    onChange={this.handleChangeBucket}
                    onOptionClick={this.handleClickBucket}
                    data={this.state.buckets}
                    inputClass="form-control"
                    id="bucket"
                    value={this.state.activeItem.bucket}
                    type="text"
                    name="bucket"
                    placeholder="Add bucket.." />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <input id="submit" className="btn btn-warning" type="submit" name="Add" />
              </div>
            </form>

          </div>

          <div id="list-wrapper">
            {tasks.map(function (task, index) {
              return (
                <div key={index} className="task-wrapper flex-wrapper">

                  <div style={{ flex: 3 }} onClick={() => self.strikeUnstrike(task)}>

                    {task.completed === false ? (
                      <span>{task.title}</span>

                    ) : (

                        <strike>{task.title}</strike>
                      )}

                  </div>
                  <div style={{ flex: 3 }} onClick={() => self.strikeUnstrike(task)}>

                    {task.completed === false ? (
                      <span>{task.bucket}</span>

                    ) : (

                        <strike>{task.bucket}</strike>
                      )}

                  </div>

                  <div style={{ flex: 1 }}>
                    <button onClick={() => self.startEdit(task)} className="btn btn-sm btn-outline-info">Edit</button>
                  </div>

                  <div style={{ flex: 1 }}>
                    <button onClick={() => self.deleteItem(task)} className="btn btn-sm btn-outline-dark delete">delete</button>
                  </div>

                </div>
              )
            })}
          </div>
        </div>

      </div>
    )
  }
}



export default App;
