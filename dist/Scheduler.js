"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scheduler = void 0;
const node_interval_tree_1 = __importDefault(require("node-interval-tree"));
const uuid_1 = require("uuid");
class Scheduler {
    constructor(visitorSchedules) {
        this.visitorSchedules = visitorSchedules;
        this.visitorTimeSlotMap = new Map();
        this.visitorFreeTimes = new node_interval_tree_1.default;
    }
    generateScheduleMap() {
        for (const visitorSchedule of this.visitorSchedules) {
            const uniqueId = (0, uuid_1.v4)();
            const startTime = visitorSchedule.date + "T" + visitorSchedule.startTime;
            const endTime = visitorSchedule.date + "T" + visitorSchedule.endTime;
            const timeSlot = {
                employeeId: visitorSchedule.employeeId,
                start: startTime,
                end: endTime
            };
            this.visitorTimeSlotMap.set(uniqueId, timeSlot);
            this.visitorFreeTimes.insert(new Date(startTime).getTime(), new Date(endTime).getTime(), uniqueId);
        }
    }
    isAVisitorAvailable(generatedDate, userSchedule) {
        const timeIntervalIdAndTimeSlotMap = new Map();
        let availableTimeSlots = new Map();
        const userTimeSlot = {
            userId: userSchedule.userId,
            start: generatedDate + "T" + userSchedule.startTime,
            end: generatedDate + "T" + userSchedule.endTime,
        };
        const eligibleTimeIntervals = this.visitorFreeTimes.search(new Date(userTimeSlot.start).getTime(), new Date(userTimeSlot.end).getTime());
        if (eligibleTimeIntervals) {
            for (const timeInterval of eligibleTimeIntervals) {
                const visitorTimeSlot = this.visitorTimeSlotMap.get(timeInterval);
                if (visitorTimeSlot) {
                    timeIntervalIdAndTimeSlotMap.set(timeInterval, visitorTimeSlot);
                }
            }
            if (timeIntervalIdAndTimeSlotMap.size > 0) {
                availableTimeSlots = new Map(this.findAvailableVisitorTimeSlots(userTimeSlot, timeIntervalIdAndTimeSlotMap));
            }
            return availableTimeSlots;
        }
        else {
            return availableTimeSlots;
        }
    }
    findAvailableVisitorTimeSlots(userTimeSlot, timeIntervalIdAndTimeSlotMap) {
        timeIntervalIdAndTimeSlotMap.forEach((value, key) => {
            if (!this.isOverlap(userTimeSlot, value)) {
                timeIntervalIdAndTimeSlotMap.delete(key);
            }
        });
        return timeIntervalIdAndTimeSlotMap;
    }
    isOverlap(slot1, slot2) {
        const [start1, end1] = [slot1.start, slot1.end].map(time => new Date(time).getTime());
        const [start2, end2] = [slot2.start, slot2.end].map(time => new Date(time).getTime());
        console.log("start1", start1);
        console.log("start2", start2);
        console.log("end1", end1);
        console.log("end2", end2);
        return start2 <= start1 && end1 <= end2;
    }
    reserveFreeTime(key, timeSlot, userTimeSlot) {
        if (userTimeSlot.start == timeSlot.start && userTimeSlot.end == timeSlot.end) {
            this.deleteFreeTime(key, timeSlot);
        }
        else {
            this.deleteFreeTime(key, timeSlot);
            let newTimeSlot;
            if (timeSlot.start != userTimeSlot.start) {
                newTimeSlot = {
                    employeeId: timeSlot.employeeId,
                    start: timeSlot.start,
                    end: userTimeSlot.start
                };
            }
            else {
                newTimeSlot = {
                    employeeId: timeSlot.employeeId,
                    start: userTimeSlot.end,
                    end: timeSlot.end
                };
            }
            this.addFreeTime(newTimeSlot);
        }
    }
    deleteFreeTime(key, timeSlot) {
        const startTime = new Date(timeSlot.start).getTime();
        const endTime = new Date(timeSlot.end).getTime();
        this.visitorFreeTimes.remove(startTime, endTime, key);
        this.visitorTimeSlotMap.delete(key);
        console.log("Deleted free time slot", timeSlot);
    }
    addFreeTime(timeSlot) {
        const newstartTime = new Date(timeSlot.start).getTime();
        const newendTime = new Date(timeSlot.end).getTime();
        const uniqueId = (0, uuid_1.v4)();
        this.visitorFreeTimes.insert(newstartTime, newendTime, uniqueId);
        this.visitorTimeSlotMap.set(uniqueId, timeSlot);
        console.log("Add new free time slot", timeSlot);
    }
    getAllTheFreeTimes() {
        this.visitorTimeSlotMap.forEach((value, key) => {
            console.log(key);
            const x = this.visitorTimeSlotMap.get(key);
            console.log(x);
            if (x) {
                const eligibleTimeIntervals = this.visitorFreeTimes.search(new Date(x.start).getTime(), new Date(x.end).getTime());
                console.log(x);
            }
        });
    }
}
exports.Scheduler = Scheduler;
