import IntervalTree from 'node-interval-tree'
import { IUserSchedule, IVisitorSchedule } from "src/interfaces";
import { v4 as uuidv4} from 'uuid';

interface TimeSlot {
    employeeId: string,
    start: string; // 2024-01-23T08:00
    end: string; // 2024-01-23T14:00
}

interface UserTimeSlot {
    userId: string,
    start: string; // 2024-01-23T08:00
    end: string; // 2024-01-23T14:00
}

class Scheduler {
    private visitorTimeSlotMap: Map<string, TimeSlot>;
    private visitorFreeTimes: IntervalTree<string>;
    private visitorSchedules: IVisitorSchedule[]

    constructor(visitorSchedules: IVisitorSchedule[]) {
        this.visitorSchedules = visitorSchedules; 
    }

    private generateScheduleMap() {
        for ( const visitorSchedule of this.visitorSchedules) {
            const uniqueId = uuidv4();
            const startTime = visitorSchedule.date + "T" + visitorSchedule.startTime;
            const endTime = visitorSchedule.date + "T" + visitorSchedule.endTime;

            const timeSlot: TimeSlot = {
                employeeId: visitorSchedule.employeeId,
                start: startTime,
                end: endTime
            }

            this.visitorTimeSlotMap.set(uniqueId, timeSlot);
            this.visitorFreeTimes.insert(new Date(startTime).getTime(), new Date(endTime).getTime(), uniqueId)
        }
    }

    private isAVisitorAvailable(generatedDate: string, userSchedule: IUserSchedule): Map<string, TimeSlot> {

        const timeIntervalIdAndTimeSlotMap = new Map<string, TimeSlot>(); // this is used to track the interval and visitorTimeSlot

        let availableTimeSlots = new Map<string, TimeSlot>();

        const userTimeSlot: UserTimeSlot = {
            userId: userSchedule._id,
            start: generatedDate + "T" + userSchedule.startTime,
            end: generatedDate + "T" + userSchedule.endTime,
        }
        const eligibleTimeIntervals: string[] = this.visitorFreeTimes.search(new Date(userTimeSlot.start).getTime(), new Date(userTimeSlot.end).getTime());

        if ( eligibleTimeIntervals) {

            for ( const timeInterval of eligibleTimeIntervals) {
                const visitorTimeSlot = this.visitorTimeSlotMap.get(timeInterval);
                if ( visitorTimeSlot)  {
                    timeIntervalIdAndTimeSlotMap.set(timeInterval, visitorTimeSlot);
                }
            }
            if ( timeIntervalIdAndTimeSlotMap.size > 0) {  
                availableTimeSlots = new Map(this.findAvailableVisitorTimeSlots(userTimeSlot, timeIntervalIdAndTimeSlotMap))
            }

            return availableTimeSlots
        }
        else {
            return availableTimeSlots
        }

    }

    private findAvailableVisitorTimeSlots(userTimeSlot: UserTimeSlot, timeIntervalIdAndTimeSlotMap: Map<string, TimeSlot>): Map<string, TimeSlot> {

        timeIntervalIdAndTimeSlotMap.forEach((value: TimeSlot, key: string) => {
            if (!this.isOverlap(userTimeSlot, value)) {
                timeIntervalIdAndTimeSlotMap.delete(key);
            }
        });
        return timeIntervalIdAndTimeSlotMap;
    }

    // Function to check if two time slots overlap 
    private isOverlap(slot1: UserTimeSlot, slot2: TimeSlot): boolean {
        const [start1, end1] = [slot1.start, slot1.end].map(time => new Date(time).getTime());
        const [start2, end2] = [slot2.start, slot2.end].map(time => new Date(time).getTime());
        console.log("start1", start1)
        console.log("start2", start2)
        console.log("end1", end1)
        console.log("end2", end2)
        return start2 <= start1 && end1 <= end2;
    }

    private reserveFreeTime(key: string, timeSlot: TimeSlot, userTimeSlot: UserTimeSlot) {
    
        
        if (userTimeSlot.start == timeSlot.start && userTimeSlot.end == timeSlot.end) {

            this.deleteFreeTime(key, timeSlot);   
    
        }
        else {


            this.deleteFreeTime(key, timeSlot); 

            let newTimeSlot: TimeSlot;

            if (timeSlot.start != userTimeSlot.start) {
                newTimeSlot = {
                    employeeId: timeSlot.employeeId,
                    start: timeSlot.start,
                    end: userTimeSlot.start
                }
            }
    
            // userTimeSlot.end != timeSlot.end
            else {
                newTimeSlot = {
                    employeeId: timeSlot.employeeId,
                    start: userTimeSlot.end,
                    end: timeSlot.end
                }
            }

            this.addFreeTime(newTimeSlot)
        }
    }

    private deleteFreeTime(key: string, timeSlot: TimeSlot) {

        const startTime = new Date(timeSlot.start).getTime();
        const endTime = new Date(timeSlot.end).getTime();

        this.visitorFreeTimes.remove(startTime, endTime, key)
        this.visitorTimeSlotMap.delete(key);
        console.log("Deleted free time slot", timeSlot);  
    }

    private addFreeTime(timeSlot: TimeSlot) {
        const newstartTime = new Date(timeSlot.start).getTime();
        const newendTime = new Date(timeSlot.end).getTime();
        const uniqueId = uuidv4();

        this.visitorFreeTimes.insert(newstartTime, newendTime, uniqueId)
        this.visitorTimeSlotMap.set(uniqueId, timeSlot);
        console.log("Add new free time slot", timeSlot); 
    }
}