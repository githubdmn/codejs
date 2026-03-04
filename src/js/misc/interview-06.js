"use strict";

const assert = require('assert');
const fs = require("fs");

/*
We are writing software to analyze logs for toll booths on a highway. This highway is a divided highway with limited access; the only way on to or off of the highway is through a toll booth.

There are three types of toll booths:
* ENTRY (E in the diagram) toll booths, where a car goes through a booth as it enters the highway.
* EXIT (X in the diagram) toll booths, where a car goes through a booth as it exits the highway.
* MAINROAD (M in the diagram), which have sensors that record a license plate as a car drives through at full speed.


        Exit Booth                         Entry Booth
            |                                   |
            X                                   E
             \                                 /
---<------------<---------M---------<-----------<---------<----
                                         (West-bound side)

===============================================================

                                         (East-bound side)
------>--------->---------M--------->--------->--------->------
             /                                 \
            E                                   X
            |                                   |
        Entry Booth                         Exit Booth


For our first task:
1-1) Read through and understand the code and comments below. Feel free to run the code and tests.
1-2) The tests are not passing due to a bug in the code. Make the necessary changes to LogEntry to fix the bug.
*/

/*
We are interested in how many people are using the highway, and so we would like to count how many complete journeys are taken in the log file.

A complete journey consists of:
* A driver entering the highway through an ENTRY toll booth.
* The driver passing through some number of MAINROAD toll booths (possibly 0).
* The driver exiting the highway through an EXIT toll booth.

For example, the following excerpt of log lines contains complete journeys for the cars with JOX304 and THX138:

.
.
.
90750.191 JOX304 250E ENTRY
91081.684 JOX304 260E MAINROAD
91082.101 THX138 110E ENTRY
91483.251 JOX304 270E MAINROAD
91873.920 THX138 120E MAINROAD
91874.493 JOX304 280E EXIT
.
.
91982.102 THX138 290E EXIT
92301.302 THX138 300E ENTRY
92371.302 THX138 310E EXIT
.

→ This log contains 3 complete journeys:
  • JOX304: 1 journey
  • THX138: 2 journeys

You may assume that the log only contains complete journeys, and there are no missing entries.

2-1) Write a function in LogFile named countJourneys() that returns how many
     complete journeys there are in the given LogFile.
*/

class LogEntry {
	/**
	 * Represents an entry from a single log line.
	 *
	 * Log lines look like this in the file:
	 * 34400.409 SXY288 210E ENTRY
	 *
	 * Where:
	 * -> 34400.409 is the timestamp in seconds since the software was started.
	 * -> SXY288 is the license plate of the vehicle passing through the toll booth.
	 * -> 210E is the location and traffic direction of the toll booth. Here, the
	 *      toll booth is at 210 kilometers from the start of the tollway, and the E
	 *      indicates that the toll booth was on the east-bound traffic side.
	 *      Tollbooths are placed every ten kilometers.
	 * -> ENTRY indicates which type of toll booth the vehicle went through. This is
	 *      one of "ENTRY", "EXIT", or "MAINROAD".
	 */
	constructor(logLine) {
		const tokens = logLine.split(' ');
		this.timestamp = parseFloat(tokens[0]); // is string
		this.license_plate = tokens[1];
		this.booth_type = tokens[3];
		this.location = parseInt(tokens[2].slice(0, -1));
		const directionLetter = tokens[2].slice(-1);
		if (directionLetter === 'E') {
			this.direction = 'EAST';
		} else if (directionLetter === 'W') {
			this.direction = 'WEST';
		} else {
			throw new Error('Invalid direction letter');
		}
	}

	toString() {
		return `<LogEntry timestamp: ${this.timestamp} license: ${this.license_plate} location: ${this.location} direction: ${this.direction} booth type: ${this.booth_type}>`;
	}
}

class LogFile {
	/**
	 * Represents a file containing a number of log lines, converted to LogEntry objects.
	 */

	completeJourney = [];
	collection = [];


	constructor(fileContents) {
		this.logEntries = [];
		const lines = fileContents.split('\n');
		for (const line of lines) {
			if (line.trim()) {
				const logEntry = new LogEntry(line.trim());
				this.logEntries.push(logEntry);
			}
		}
	}

	get length() {
		return this.logEntries.length;
	}

	item(index) {
		return this.logEntries[index];
	}

	/**
	 * Broji kompletna putovanja.
	 * Putovanje je kompletno kada automobil prođe kroz EXIT booth.
	 */
	countJourneys() {
		let journeyCount = 0;
		for (const entry of this.logEntries) {
			if (entry.booth_type === 'EXIT') {
				journeyCount++;
			}
		}
		return journeyCount;
	}
}

const testMethods = {
	// These tests are not meant to be exhaustive, and primarily show usage.
	testLogFile: () => {
		const logFile = new LogFile(fs.readFileSync("/content/test/tollbooth_small.log", "utf-8"));
		assert(logFile.length === 13);
		for (const entry of logFile.logEntries) {
			assert(entry instanceof LogEntry);
		}
	},
	testLogEntry: () => {
		let logLine = '44776.619 KTB918 310E MAINROAD';
		let logEntry = new LogEntry(logLine);
		assert(logEntry.timestamp === 44776.619);
		assert(logEntry.license_plate === 'KTB918');
		assert(logEntry.location === 310);
		assert(logEntry.direction === 'EAST');
		assert(logEntry.booth_type === 'MAINROAD');

		logLine = '52160.132 ABC123 400W ENTRY';
		logEntry = new LogEntry(logLine);
		assert(logEntry.timestamp === 52160.132);
		assert(logEntry.license_plate === 'ABC123');
		assert(logEntry.location === 400);
		assert(logEntry.direction === 'WEST');
		assert(logEntry.booth_type === 'ENTRY');
	},
	testCountJourneys: () => {
		let logFile = new LogFile(fs.readFileSync("/content/test/tollbooth_small.log", "utf-8"));
		assert.strictEqual(logFile.countJourneys(), 3);

		logFile = new LogFile(fs.readFileSync("/content/test/tollbooth_medium.log", "utf-8"));
		assert.strictEqual(logFile.countJourneys(), 63);
	},
}

// run all tests
Object.getOwnPropertyNames(testMethods).forEach((func) => {
	try {
		console.log(`Running ${func}`);
		testMethods[func]();
		console.log('OK');
	} catch (e) {
		console.log('FAIL');
		console.log(e);
	}
	console.log('');
});
