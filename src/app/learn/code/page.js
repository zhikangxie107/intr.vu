'use client';
import { useState } from 'react';
import AICard from '@/components/aiCard';
import ProblemTemplate from '@/components/problemTemplate';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';

export default function InterviewPage() {
	const [code, setCode] = useState(
	);
	const [output, setOutput] = useState('');

	const handleRun = () => {
		try {
			// Very simple sandboxed execution simulation
			const fn = new Function(`${code}; return twoSum([2,7,11,15], 9);`);
			const result = fn();
			setOutput(`Output: ${JSON.stringify(result)}`);
		} catch (err) {
			setOutput(`Error: ${err.message}`);
		}
	};

	// Sample problem data (can be replaced later)
	const problemData = {
		title: '1. Two Sum',
		description: [
			'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
			'You may assume that each input would have exactly one solution, and you may not use the same element twice.',
			'You can return the answer in any order.',
		],
		examples: [
			{
				input: 'nums = [2,7,11,15], target = 9',
				output: '[0,1]',
				explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
			},
			{
				input: 'nums = [3,2,4], target = 6',
				output: '[1,2]',
			},
			{
				input: 'nums = [3,3], target = 6',
				output: '[0,1]',
			},
		],
		constraints: [
			'2 <= nums.length <= 10⁴',
			'-10⁹ <= nums[i] <= 10⁹',
			'-10⁹ <= target <= 10⁹',
			'Only one valid answer exists.',
		],
	};

	return (
		<div style={styles.page}>
			{/* Main content */}
			<div style={styles.main}>
				{/* Left: AI + Problem */}
				<div style={styles.leftPane}>
					<div style={styles.aiCardContainer}>
						<AICard />
					</div>
					<div style={styles.problemContainer}>
						<ProblemTemplate {...problemData} />
					</div>
				</div>

				{/* Right: Editor + Output */}
				<div style={styles.rightPane}>
					<div style={styles.editorContainer}>
						<CodeMirror
							value={code}
							height="400px"
							extensions={[python()]}
							onChange={(value) => setCode(value)}
							style={styles.codeMirror}
						/>
					</div>

					<div style={styles.outputContainer}>
						<div style={styles.outputHeader}>
							<span>Output</span>
							<button style={styles.runButton} onClick={handleRun}>
								Run
							</button>
						</div>
						<pre style={styles.outputBox}>{output}</pre>
					</div>
				</div>
			</div>
		</div>
	);
}

const styles = {
	page: {
		display: 'flex',
		height: '100vh',
		width: '100vw',
		fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
		backgroundColor: '#f5f7fa',
		overflow: 'hidden',
	},
	main: {
		flex: 1,
		display: 'flex',
		flexDirection: 'row',
		overflowX: 'auto',
		overflowY: 'hidden',
		scrollSnapType: 'x mandatory',
	},

	leftPane: {
		flex: '0 0 50%',
		display: 'flex',
		flexDirection: 'column', // stack vertically now
		justifyContent: 'space-between',
		backgroundColor: '#fff',
		borderRight: '1px solid #e0e0e0',
		padding: '24px',
		height: '100vh',
		boxSizing: 'border-box',
		overflow: 'hidden', // prevent vertical scroll
		scrollSnapAlign: 'start',
		gap: '20px',
	},

	aiCardContainer: {
		flex: '0 0 40%', // top portion
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},

	problemContainer: {
		flex: '1', // remaining height
		overflowY: 'auto', // allows problem text to scroll internally
	},
	rightPane: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		backgroundColor: '#f7f9fb',
	},
	editorContainer: {
		flex: 1,
		borderBottom: '1px solid #e0e0e0',
	},
	codeMirror: {
		fontSize: '14px',
		fontFamily: 'monospace',
	},
	outputContainer: {
		padding: '12px 16px',
		backgroundColor: '#fff',
		borderTop: '1px solid #e0e0e0',
	},
	outputHeader: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: '8px',
		fontWeight: '500',
	},
	runButton: {
		background: 'none',
		border: 'none',
		color: '#22c55e',
		fontWeight: '600',
		cursor: 'pointer',
		transition: 'color 0.2s ease',
	},
	outputBox: {
		backgroundColor: '#f5f5f5',
		borderRadius: '6px',
		minHeight: '60px',
		padding: '10px',
		fontFamily: 'monospace',
		fontSize: '13px',
		whiteSpace: 'pre-wrap',
		color: '#222',
	},
};
