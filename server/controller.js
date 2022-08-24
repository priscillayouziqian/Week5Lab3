//import the dotenv package, configure it, so we can use the variables.
require("dotenv").config();

//import sequelize. Note that the default export is a class.
const Sequelize = require("sequelize");

//destructure the CONNECTION_STRING from our process.env object.
const {CONNECTION_STRING} = process.env;

//instantiate a sequelize object from the Sequelize class.
const sequelize = new Sequelize(CONNECTION_STRING, {
    dialect: "postgres",
    dialectOptions: { //hey, I don't need any security while it comes out to access my data---just because it is a small project for educational purposes.
        ssl: {
            rejectUnauthorized: false
        }
    }
})

let nextEmp = 5

const userId = 4;
const clientId = 3;

module.exports = {
    getUpcomingAppointments: (req, res) => {
        sequelize.query(`select a.appt_id, a.date, a.service_type, a.approved, a.completed, u.first_name, u.last_name 
        from cc_appointments a
        join cc_emp_appts ea on a.appt_id = ea.appt_id
        join cc_employees e on e.emp_id = ea.emp_id
        join cc_users u on e.user_id = u.user_id
        where a.approved = true and a.completed = false
        order by a.date desc;`)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
    },

    approveAppointment: (req, res) => {
        let {apptId} = req.body
    
        sequelize.query(`UPDATE cc_appointments
        SET approved=true
        WHERE appt_id=${apptId}; 
        // don't forget the ; in order to complete the SQL statement!!!
        
        insert into cc_emp_appts (emp_id, appt_id)
        values (${nextEmp}, ${apptId}),
        (${nextEmp + 1}, ${apptId});
        `)
            .then(dbRes => {
                res.status(200).send(dbRes[0])
                nextEmp += 2
            })
            .catch(err => console.log(err))
    },
    getAllClients: (req, res) => {
        sequelize.query(`SELECT * FROM cc_users AS u
        JOIN cc_clients AS c
        ON c.user_id = u.user_id
        `)
            .then(dbRes => {
                res.status(200).send(dbRes[0])
               
            })
            .catch(err => console.log(err))
    },
    getPendingAppointments: (req, res) => {
        sequelize.query(`SELECT * FROM cc_appointments
        WHERE approved=false
        ORDER BY date DESC;
        `)
            .then(dbRes => {
                res.status(200).send(dbRes[0])
               
            })
            .catch(err => console.log(err))
    },
    getPastAppointments: (req, res) => {
        sequelize.query(`select a.appt_id, a.date, a.service_type, a.notes, u.first_name, u.last_name 
        from cc_appointments a
        join cc_users u on u.user_id = a.client_id
    
        where a.approved = true and a.completed = true
        order by a.date desc;`)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
    },
    completeAppointment: (req, res) => {
        let {apptId} = req.body

        sequelize.query(`UPDATE cc_appointments
        SET completed=true
        WHERE appt_id=${apptId}`)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
    }
}
