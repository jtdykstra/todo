import React, { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// TODO: Double click delete fix
// TODO: Authentication
// TODO: Update of table on backend timer deletion?

function Form(props) {
  return <form onSubmit={props.handleFormSubmit}>
      <label>
        Reminder:
        <input type="text" value={props.formVal} onChange={e => props.onFormChange(e)} /> 
        Time:
      </label>
      <input type="submit" value="Submit" />
    </form>
}

function Table(props) {
  const rows = props.data.map((row, index) => {
    return (
      <tr key={index}>
        <td>{row.reminder}</td>
        <td>{row.unixTime}</td>
        <td>
          <button onClick={() => {props.handleClick(row.id)}}>Delete!</button>
        </td>
      </tr>
    )
  })

  return <table>
          <tbody>
            {rows}
          </tbody>
         </table>
}

function App(props) {
  // Remind data array
  const [reminderData, setReminderData] = useState([]);
  const [reminderDate, setReminderDate] = useState(new Date());
  const [formVal, setFormVal] = useState('')

  useEffect(() => { 
    fetch('http://localhost:5000/reminder')
    .then(res => res.json())
    .then(data => {
      setReminderData(data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }, []);

  function handleClick(i) {
    const deletion = { 'delete': i };

    fetch('http://localhost:5000/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deletion),
    })
    .catch((error) => {
      console.error('Error:', error);
    });

    fetch('http://localhost:5000/reminder')
    .then(res => res.json())
    .then(data => {
      setReminderData(data);
    });
  }

  function handleFormSubmit(event) {
    console.log(formVal)
    let toSubmit = {'reminder':formVal, 'unixTime':reminderDate.getTime()}
    
    fetch('http://localhost:5000/reminder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(toSubmit),
    })
    .then(() => {
      fetch('http://localhost:5000/reminder').then(res => res.json()).then(data => {
        setReminderData(data);
      });
    })
    .catch((error) => {
      console.error('Error:', error);
    });

    event.preventDefault();
  }

  function handleFormChange(event) {
    setFormVal(event.target.value);
  }
  
  return (
      <div>
          <DatePicker
            selected={reminderDate}
            onChange={date => {setReminderDate(date)}}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            timeCaption="time"
            dateFormat="MMMM d, yyyy h:mm aa"
          />
        <Form 
          formVal = {formVal}
          onFormChange={handleFormChange}
          handleFormSubmit={handleFormSubmit}
        />
        Table Entries
        <Table 
          data={reminderData} 
          handleClick={handleClick} 
        /> 
      </div>
  );
}

export default App