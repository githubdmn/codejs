// Task 2 - Show only items with “normal” priority

const tickets = [
	{
		id: 'fbf0355e-fc3f-11ec-a53e-b89a2abe049c',
		created: '2022-07-05 08:23:54',
		title: 'Ticket title 1',
		priority: 'critical',
		status: 'work',
		price: 4.9,
	},
	{
		id: '690a9e5e-59b4-46c4-b607-b31ee8205ef3',
		created: '2022-07-04 08:23:54',
		title: 'Ticket title 2',
		priority: 'normal',
		status: 'closed',
		price: 2.1,
	},
	{
		id: '51509793-7219-45ec-bf8c-dc83f3f71e92',
		created: '2022-07-05 10:11:14',
		title: 'Ticket title 3',
		priority: 'normal',
		status: 'work',
		price: 21.01,
	},
	{
		id: 'e837afed-4dc3-439e-bbf1-71a37a293fd0',
		created: '2022-07-05 03:38:24',
		title: 'Ticket title 4',
		priority: 'high',
		status: 'work',
		price: 1.23,
	},
];

console.log(
	tickets.filter((item) => {
		if (item.priority === 'normal') return item.priority;
	}),
);

// Task 3 - Transforming data from Array to Object

const lookups = {
	statuses: {
		1: 'open',
		2: 'work',
		3: 'closed',
		4: 'rejected',
		5: 'waiting',
	},
	priorities: {
		1: 'low',
		2: 'normal',
		3: 'high',
		4: 'critical',
	},
};

const tickets = [
	{
		id: 'dc81772e-450e-493e-abf9-38d09200876f',
		title: 'Ticket title 1',
		priority: '3',
		status: '2',
	},
	{
		id: '8825eab1-260b-4c4b-bcbc-40649df8ca4b',
		title: 'Ticket title 2',
		priority: '4',
		status: '3',
	},
	{
		id: 'fdb9013c-f5fc-4971-b5d2-f39b99b69e2c',
		title: 'Ticket title 3',
		priority: '1',
		status: '3',
	},
	{
		id: '7c63187e-b10b-46d7-932d-37ea674f8134',
		title: 'Ticket title 4',
		priority: '3',
		status: '1',
	},
];

// Expected result:

// Object of tickets by ticket id with priority and status translated into matching names from lookups, eg:

// tickets = {
// 	some_uuid: {
// 		title: title_from_the_ticket,
// 		priority: ‘normal’,
// 		status: ‘open’
// 		},
// .
// .
// .
// }

function convertPriority(priority) {
	if (prority == 1) {
		return lookups.statuses;
	}
}

function convertStatus(status) {}

const newTickets = {};

tasks.forEach((task) => {
	newTickets[task.id] = {
		title: task.title,
		priority: convertPriority(task.priority),
		status: convertStatus(task.status),
	};
});
