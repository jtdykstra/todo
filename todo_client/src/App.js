import React, { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// TODO: Add time logic for API calls
// TODO: Add form for time

function Form(props) {
  const [val, setVal] = useState('')

  function handleSubmit(event) {
    let toSubmit = {'reminder':val, 'unixTime':1234}
    fetch('http://localhost:5000/reminder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(toSubmit),
    })
    .then(() => {
      props.handleFormSubmit()
    })
    .catch((error) => {
      console.error('Error:', error);
    });

    event.preventDefault();
  }

  return <form onSubmit={handleSubmit}>
      <label>
        Reminder:
        <input type="text" value={val} onChange={e => setVal(e.target.value)} /> 
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
  const [startDate, setStartDate] = useState(new Date());

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

  function handleFormSubmit() {
    // just refresh the data. *probably* a better way 
    // to do this than just fetching the data again. TODO. 
    fetch('http://localhost:5000/reminder').then(res => res.json()).then(data => {
      setReminderData(data);
    });
  }

  return (
      <div>
          <DatePicker
            selected={startDate}
            onChange={date => {setStartDate(date);console.log(date.getTime())}}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            timeCaption="time"
            dateFormat="MMMM d, yyyy h:mm aa"
          />
        <Form 
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