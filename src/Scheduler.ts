import IntervalTree from 'node-interval-tree'

import { v4 as uuidv4} from 'uuid';
import { IVisitorSchedule } from './Interfaces/visitorSchedule';
import { IUserSchedule } from './Interfaces/userSchedule';
import { TimeSlot, UserTimeSlot } from './Interfaces/timeslot';


export class Scheduler {
    visitorTimeSlotMap: Map<string, TimeSlot>;
    visitorFreeTimes: IntervalTree<string>;
    visitorSchedules: IVisitorSchedule[]

    constructor(visitorSchedules: IVisitorSchedule[]) {
        this.visitorSchedules = visitorSchedules;
        this.visitorTimeSlotMap = new Map<string, TimeSlot>();
        this.visitorFreeTimes = new IntervalTree<string>;
    }

    generateScheduleMap() {
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

    isAVisitorAvailable(generatedDate: string, userSchedule: IUserSchedule): Map<string, TimeSlot> {

        const timeIntervalIdAndTimeSlotMap = new Map<string, TimeSlot>(); // this is used to track the interval and visitorTimeSlot

        let availableTimeSlots = new Map<string, TimeSlot>();

        const userTimeSlot = this.generateUserTimeSlot(generatedDate, userSchedule);

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

    reserveFreeTime(key: string, timeSlot: TimeSlot, generatedDate: string, userSchedule: IUserSchedule) {
    
        const userTimeSlot = this.generateUserTimeSlot(generatedDate, userSchedule);

        if (userTimeSlot.start == timeSlot.start && userTimeSlot.end == timeSlot.end) {

            this.deleteFreeTime(key, timeSlot);   
    
        }
        else {


            this.deleteFreeTime(key, timeSlot); 

            if (timeSlot.start != userTimeSlot.start) {
                const newTimeSlot: TimeSlot = {
                    employeeId: timeSlot.employeeId,
                    start: timeSlot.start,
                    end: userTimeSlot.start
                }

                this.addFreeTime(newTimeSlot)
            }
    
            if (userTimeSlot.end != timeSlot.end) {
                const newTimeSlot: TimeSlot = {
                    employeeId: timeSlot.employeeId,
                    start: userTimeSlot.end,
                    end: timeSlot.end
                }

                this.addFreeTime(newTimeSlot)
            }
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

    private generateUserTimeSlot(generatedDate: string, userSchedule: IUserSchedule): UserTimeSlot {
        const userTimeSlot: UserTimeSlot = {
            userId: userSchedule.userId,
            start: generatedDate + "T" + userSchedule.startTime,
            end: generatedDate + "T" + userSchedule.endTime,
        }

        return userTimeSlot;
    }
    
    getAllTheFreeTimes() {
        console.log("Free employee schedules")
        this.visitorTimeSlotMap.forEach( (value, key) => {
            console.log(key);
            const x = this.visitorTimeSlotMap.get(key);
            console.log(x)
            if ( x ) {
                const eligibleTimeIntervals: string[] = this.visitorFreeTimes.search(new Date(x.start).getTime(), new Date(x.end).getTime());
                console.log(eligibleTimeIntervals)
            }
        })
    }
}