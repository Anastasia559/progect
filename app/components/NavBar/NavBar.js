import React from 'react';
import { NavLink } from 'react-router-dom';



const NavBar = () => {

  return (
    <nav className={classes.nav}>
      <div className={classes.fio}>
        <h3>ФИО - {Storage2.user.username}</h3>
        <h3>ФИО - {Storage2.profile}</h3>
        <div>id - {Storage2.user.id}</div>
        <br/>
      </div>
      {
        Storage2.user.role === 2 &&
        <div className={classes.item}>
          <NavLink to="/profile" activeClassName={classes.activePust}>Персональные данные</NavLink>
        </div>
      }
      {
        Storage2.user.role === 2 &&
        <div className={classes.item}>
          <NavLink to="/dialogs" activeClassName={classes.activePust}>Сообщения</NavLink>
        </div>
      }
      <div className={classes.item}>
        <NavLink to="/news" activeClassName={classes.activePust}>Доска обьявлений</NavLink>
      </div>
      <div className={classes.item}>
        <NavLink to="/connectToStudents" activeClassName={classes.activePust}>Связь со студентами</NavLink>
      </div>
      <div className={classes.item}>
        <NavLink to="/connectToOrganization" activeClassName={classes.activePust}>Связь с организацией</NavLink>
      </div>
      <div className={classes.item}>
        <NavLink to="/umk" activeClassName={classes.activePust}>УМК</NavLink>
      </div>
      <div className={classes.item}>
        <NavLink to="/timetable" activeClassName={classes.activePust}>Расписание</NavLink>
      </div>
      <div className={classes.item}>
        <NavLink to="/webinar" activeClassName={classes.activePust}>Вебинар</NavLink>
      </div>
      <div className={classes.item}>
        <NavLink to="/visitsLog" activeClassName={classes.activePust}>Журнал посещений</NavLink>
      </div>
      <div className={classes.item}>
        <NavLink to="/eStatement" activeClassName={classes.activePust}>Электронная ведомость</NavLink>
      </div>
      <div className={classes.item}>
        <NavLink to="/testing" activeClassName={classes.activePust}>Тестирование</NavLink>
      </div>
      <div className={classes.item}>
        <NavLink to="/questioning" activeClassName={classes.activePust}>Анкетирование</NavLink>
      </div>
      {/* <div className={classes.item}>
        <NavLink to="/login" activeClassName={classes.activePust}>логин</NavLink>
      </div> */}
    </nav>
  );
}

export default NavBar;