import React, { Component } from 'react';

//import MenuPopup from "reactjs-popup";
//import logo from './logo.svg';
import './Home.css';
import { stat } from 'fs';

function Event(props){
  return(
    <li>
      <div className="Event">
        <p id='eventName'>{props.name}</p>
        <p id='eventDesc'>{props.description}</p>
        <p id='eventDate'>{props.date}</p>
        <p id='eventTime'>{props.time}</p>
        <button id='edit'>Edit</button>
        <button id='delete'>Delete</button>
      </div>
    </li>
  );
}

let myEvent ={
  eventID: 1,
  name: 'Do Homework',
  description:'CSE 111',
  date: '12/03/2018',
  time: '18:00',
};

let myEvent2 ={
  eventID: 2,
  name: 'Do Project',
  description:'CSE 111',
  date: '12/03/2018',
  time: '20:00',
};

function EventList(props){
  let events =[];
  events.push(myEvent);
  events.push(myEvent2);

  const listEvents = events.map((event) => 
    <Event key = {event.eventID.toString()}
           name = {event.name}
           description = {event.description}
           date = {event.date}
           time = {event.time}
    />
  );

  return (
    <div className = 'EventContainer'>
      <ul className = 'EventList'>
        {listEvents}
      </ul>
    </div>
    
  );
}

function StaticEventForm(props){

  let state = {
    staticEvent:{
      username: props.username,
      eventID: null,
      eventName: null,
      eventDesc: null, 
      startDate: {
        month: null,
        day: null,
        year:null,
      },
      endDate:{
        month: null,
        day: null,
        year:null,
      },
      startTime: null,
      endTime: null,
    }
  };

  function setStartMonth(event){
    state = {staticEvent:{
      ...state.staticEvent,
      startDate:{
        ...state.staticEvent.startDate,
        month: event.target.value,
      },
    }}
  }
  function setStartDay(event){
    state = {staticEvent:{
      ...state.staticEvent,
      startDate:{
        ...state.staticEvent.startDate,
        day: event.target.value,
      },
    }}
  }
  function setStartYear(event){
    state={staticEvent:{
      ...state.staticEvent,
      startDate:{
        ...state.staticEvent.startDate,
        year: event.target.value,
      },
    }}
  }
  function setStartTime(event){
    state = {staticEvent:{
      ...state.staticEvent,
      startTime: event.target.value,
    }}
  }
  function setEndTime(event){
    state = {staticEvent:{
      ...state.staticEvent,
      endTime: event.target.value,
    }}
  }

  if (props.active)
    return(
    <div>
      <form>
        <p>Event Name:</p>
        <input
          type='text'
          value={state.staticEvent.eventName}
          onChange={e=>state.staticEvent={
            staticEvent:{
              ...state.staticEvent,
              eventName: e.target.value
            }
          }}
        />
        <p>Description:</p>
        <input
          type='text'
          value={state.staticEvent.eventDesc}
          onChange={e=>state.staticEvent={
            staticEvent:{
              ...state.staticEvent,
              eventName: e.target.value
            }
          }}
        />
        <p>Date:</p>
        <select id = 'dateMonth' onChange={setStartMonth}>
          <option value='10'>10</option>
          <option value='11'>11</option>
          <option value='12'>12</option>
        </select>
        <select id = 'dateDay' onChange={setStartDay}>
          <option value='00'>00</option>
          <option value='01'>01</option>
          <option value='02'>02</option>
          <option value='03'>03</option>
          <option value='04'>04</option>
          <option value='05'>05</option>
          <option value='06'>06</option>
          <option value='07'>07</option>
          <option value='08'>08</option>
          <option value='09'>09</option>
          <option value='10'>10</option>
          <option value='11'>11</option>
          <option value='12'>12</option>
          <option value='13'>13</option>
          <option value='14'>14</option>
          <option value='15'>15</option>
          <option value='16'>16</option>
          <option value='17'>17</option>
          <option value='18'>18</option>
          <option value='19'>19</option>
          <option value='20'>20</option>
          <option value='21'>21</option>
          <option value='22'>22</option>
          <option value='23'>23</option>
          <option value='24'>24</option>
          <option value='25'>25</option>
          <option value='26'>26</option>
          <option value='27'>27</option>
          <option value='28'>28</option>
          <option value='29'>29</option>
          <option value='30'>30</option>
          <option value='31'>31</option>
        </select>
        <select id = 'dateYear' onChange={setStartYear}>
          <option value='2018'>2018</option>
        </select>
        <p>Start Time:</p>
        <select id = 'startTime' onChange={setStartTime}>
          <option value = '00:00'>12 AM</option>
          <option value = '01:00'>1 AM</option>
          <option value = '02:00'>2 AM</option>
          <option value = '03:00'>3 AM</option>
          <option value = '04:00'>4 AM</option>
          <option value = '05:00'>5 AM</option>
          <option value = '06:00'>6 AM</option>
          <option value = '07:00'>7 AM</option>
          <option value = '08:00'>8 AM</option>
          <option value = '09:00'>9 AM</option>
          <option value = '10:00'>10 AM</option>
          <option value = '11:00'>11 AM</option>
          <option value = '12:00'>12 PM</option>
          <option value = '13:00'>1 PM</option>
          <option value = '14:00'>2 PM</option>
          <option value = '15:00'>3 PM</option>
          <option value = '16:00'>4 PM</option>
          <option value = '17:00'>5 PM</option>
          <option value = '18:00'>6 PM</option>
          <option value = '19:00'>7 PM</option>
          <option value = '20:00'>8 PM</option>
          <option value = '21:00'>9 PM</option>
          <option value = '22:00'>10 PM</option>
          <option value = '23:00'>11 PM</option>
        </select>
        <p>End Time:</p>
        <select id = 'endTime' onChange={setEndTime}>
          <option value = '00:00'>12 AM</option>
          <option value = '01:00'>1 AM</option>
          <option value = '02:00'>2 AM</option>
          <option value = '03:00'>3 AM</option>
          <option value = '04:00'>4 AM</option>
          <option value = '05:00'>5 AM</option>
          <option value = '06:00'>6 AM</option>
          <option value = '07:00'>7 AM</option>
          <option value = '08:00'>8 AM</option>
          <option value = '09:00'>9 AM</option>
          <option value = '10:00'>10 AM</option>
          <option value = '11:00'>11 AM</option>
          <option value = '12:00'>12 PM</option>
          <option value = '13:00'>1 PM</option>
          <option value = '14:00'>2 PM</option>
          <option value = '15:00'>3 PM</option>
          <option value = '16:00'>4 PM</option>
          <option value = '17:00'>5 PM</option>
          <option value = '18:00'>6 PM</option>
          <option value = '19:00'>7 PM</option>
          <option value = '20:00'>8 PM</option>
          <option value = '21:00'>9 PM</option>
          <option value = '22:00'>10 PM</option>
          <option value = '23:00'>11 PM</option>
        </select>
      </form>
    </div>
  );
  else return (null);
}

function Popup(props){ 

  let state = {
    staticEventFormActive: false,
    flexEventFormActive:false,
    staticEvent:{
      username: props.username,
      eventID: null,
      eventName: null,
      eventDesc: null, 
      startDate: {
        month: null,
        day: null,
        year:null,
      },
      endDate:{
        month: null,
        day: null,
        year:null,
      },
      startTime: null,
      endTime: null,
    }
  }

  let createStaticEvent = props.createStaticEvent;

  function getStaticEvent(staticEvent){
    state.staticEvent= staticEvent;
  }

  function toggleStaticForm(){
    //if(state.flexEventFormActive)
    state.flexEventFormActive=false;
    state.staticEventFormActive=!state.staticEventFormActive;
  }
  function toggleFlexForm(){
    if(state.staticEventFormActive)
      state.staticEventFormActive=false;
    state.flexEventFormActive=!state.flexEventFormActive;
  }

  if(!props.active){
    return(null);
  }else return(
    <div id = 'createEventTypeWindow'>
      <button id = 'createStaticEvent' onClick={()=>state.staticEventFormActive=!state.staticEventFormActive}>Create Static Event</button>
      <br/>
      <button id = 'createFlexEvent' onClick={toggleFlexForm}>Create Flex Event</button>
      <StaticEventForm
        createStaticEvent = {createStaticEvent}
        getStaticEvent = {getStaticEvent}
        active = {state.staticEventFormActive}
      />
    </div>
  );
  
}

class Home extends Component {

  constructor(props){
    super(props);
    this.state = {
      popupActive : false,
      username: this.props.username,
      token: this.props.token,
    }
  }

  toggleCreateEvent = () => {
      this.setState({popupActive: !this.state.popupActive});
  }
 
  createStaticEvent = async e =>{
    e.preventDefault();
    const response = await fetch('/api/addEvent', {
      method: 'POST',
      headers:{
        'Content-Type': 'application/json',
      },
      body:JSON.stringify({}),
    });
  }


  render() {
    return (
        <div className= 'Home'>
          <header className="Header">
            <p>
              Scheduler Project 
            </p>
          </header>
          <EventList/>
          <Popup
            active = {this.state.popupActive}
            username={this.state.username}
            createStaticEvent={this.createStaticEvent}/>
          <button id='createEvent' onClick={this.toggleCreateEvent}>Create Event</button>
        </div>
    );
  }
}
export default Home;
