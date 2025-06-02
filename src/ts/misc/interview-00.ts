/**         Balanced Brackets
A bracket is considered to be any one of the following
characters: (, ), {, }, [, or ].
Two brackets are considered to be a matched pair if the opening bracket
(i.e., (, [, or {) occurs to the left of a closing bracket
(i.e., ), ], or }) of the exact same type.
There are three types of matched pairs of brackets: [], {}, and ().
A matching pair of brackets is not balanced if the set of brackets it
encloses are not matched. For example, {[(])} is not balanced because
the contents in between { and } are not balanced. The pair of square
brackets encloses a single, unbalanced opening bracket, (, and the pair
of parentheses encloses a single, unbalanced closing square bracket, ].
By this logic, we say a sequence of brackets is balanced if the following
conditions are met:
    • It contains no unmatched brackets.
    • The subset of brackets enclosed within the confines of a matched pair
    of brackets is also a matched pair of brackets.
Given  strings of brackets, determine whether each sequence of brackets
is balanced. If a string is balanced, return YES. Otherwise, return NO.
Function Description
Create the function isBalanced:
    • isBalanced has the following parameter(s):
    • string s: a string of brackets
Returns
    • string: either YES or NO
Input Format
The first line contains a single integer , the number of strings.
Each of the next  lines contains a single string , a sequence of brackets.
Output Format
For each string, return YES or NO.


Sample Input
['{[()]}', '{[(])}', '{{[[(())]]}}']
Sample Output
YES
NO
YES

Explanation
    1. The string {[()]} meets both criteria for being a balanced string.
    2. The string {[(])} is not balanced because the brackets enclosed by the
    matched pair { and } are not balanced: [(]).
    3. The string {{[[(())]]}} meets both criteria for being a balanced string.

 */


let input;//: string[];
input = ['{[()]}', '{[(])}', '{{[[(())]]}}'];

function isBalancedA(s: string): string {
	const open: string[] = [];
	for (let i = 0; i < s.length; i++) {
		const char = s[i];
		if (char === '(' || char === '[' || char === '{') {
			open.push(char);
		} else {
			const last = open.pop();
			if (
				(char === ')' && last !== '(') ||
				(char === ']' && last !== '[') ||
				(char === '}' && last !== '{')
			) {
				return 'NO';
			}
		}
	}
	return open.length === 0 ? 'YES' : 'NO';
}

// Optional: A naive half-checking method (not reliable for nested structures)
function isBalancedB(s: string): string {
	const length = s.length;
	for (let i = 0; i < length / 2; i++) {
		const start = s[i];
		const end = s[length - 1 - i];
		if (
			(start === '(' && end !== ')') ||
			(start === '[' && end !== ']') ||
			(start === '{' && end !== '}')
		) {
			return 'NO';
		}
	}
	return 'YES';
}

// Debug wrappers
function callA(element: string): void {
	console.time(isBalancedA.name);
	console.log(isBalancedA(element));
	console.timeEnd(isBalancedA.name);
}

function callB(element: string): void {
	console.time(isBalancedB.name);
	console.log(isBalancedB(element));
	console.timeEnd(isBalancedB.name);
}



const run = () => {
	// Run for each input
	input.forEach((element) => {
		callA(element);
		callB(element);
	});
};

export default run;