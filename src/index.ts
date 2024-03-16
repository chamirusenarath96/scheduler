import { IUserSchedule } from "./Interfaces/userSchedule";
import { IVisitorSchedule } from "./Interfaces/visitorSchedule";
import { Scheduler } from "./Scheduler";

const visitorSchedules: IVisitorSchedule[] = [
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
    }
]

const userSchedule: IUserSchedule = {
    userId: "user_1",
    startTime: "10:00",
    endTime: "13:00",
}
const newScheduler = new Scheduler(visitorSchedules)

newScheduler.generateScheduleMap()

newScheduler.getAllTheFreeTimes()

const map = newScheduler.isAVisitorAvailable("2024-03-20", userSchedule);

console.log("Available schedules")
map.forEach((value, key) => {
    console.log(key)
    console.log(value)
    if ( value.employeeId == "employee_2") {
        newScheduler.reserveFreeTime(key, value, "2024-03-20", userSchedule)
    }
});

console.log("After Scheduling")

newScheduler.getAllTheFreeTimes()


