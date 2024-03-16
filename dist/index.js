"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Scheduler_1 = require("./Scheduler");
const visitorSchedules = [
    {
        employeeId: "employee_1",
        date: "2024-03-19",
        startTime: "05:00",
        endTime: "18:00",
    },
    {
        employeeId: "employee_2",
        date: "2024-03-20",
        startTime: "05:00",
        endTime: "18:00",
    },
    {
        employeeId: "employee_3",
        date: "2024-03-21",
        startTime: "05:00",
        endTime: "18:00",
    },
];
const newScheduler = new Scheduler_1.Scheduler(visitorSchedules);
newScheduler.generateScheduleMap();
newScheduler.getAllTheFreeTimes();
