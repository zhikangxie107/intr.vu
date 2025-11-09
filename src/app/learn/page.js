import React from 'react';
import styles from './page.module.css';
import InfoBoxCarosel from '../components/Box/InfoBoxCarousel';
import FeaturedCourseCard from '../components/Box/FeaturedCourseCard';
import ProblemsGrid from "../components/Box/ProblemsGrid";


export default function Learn() {
  const problems = [
    { id: 1, title: "Two Sum", tag: "Arrays", duration: "10–15m", likes: 4210, difficulty: "Beginner", startHref: "/problems/two-sum" },
    { id: 2, title: "Valid Parentheses", tag: "Stacks", duration: "10–15m", likes: 3180, difficulty: "Beginner", startHref: "/problems/valid-parentheses" },
    { id: 3, title: "LRU Cache", tag: "Design", duration: "25–35m", likes: 1675, difficulty: "Intermediate", startHref: "/problems/lru-cache" },
    { id: 4, title: "Merge Intervals", tag: "Intervals", duration: "15–25m", likes: 2840, difficulty: "Intermediate", startHref: "/problems/merge-intervals" },
    { id: 5, title: "Longest Substring Without Repeating Characters", tag: "Sliding Window", duration: "20–30m", likes: 3890, difficulty: "Intermediate", startHref: "/problems/longest-substring-without-repeating-characters" },
    { id: 6, title: "Binary Search", tag: "Search", duration: "5–10m", likes: 1520, difficulty: "Beginner", startHref: "/problems/binary-search" },
    { id: 7, title: "Median of Two Sorted Arrays", tag: "Divide and Conquer", duration: "30–45m", likes: 2105, difficulty: "Advanced", startHref: "/problems/median-two-sorted-arrays" },
    { id: 8, title: "Maximum Subarray", tag: "Dynamic Programming", duration: "15–20m", likes: 2600, difficulty: "Beginner", startHref: "/problems/maximum-subarray" },
    { id: 9, title: "Number of Islands", tag: "DFS/BFS", duration: "20–30m", likes: 1975, difficulty: "Intermediate", startHref: "/problems/number-of-islands" },
    { id: 10, title: "Word Ladder", tag: "Graphs", duration: "25–35m", likes: 1310, difficulty: "Intermediate", startHref: "/problems/word-ladder" },
    { id: 11, title: "Flatten Binary Tree to Linked List", tag: "Trees", duration: "15–25m", likes: 980, difficulty: "Intermediate", startHref: "/problems/flatten-binary-tree-to-linked-list" },
    { id: 12, title: "Best Time to Buy and Sell Stock", tag: "Greedy", duration: "10–15m", likes: 2999, difficulty: "Beginner", startHref: "/problems/best-time-to-buy-and-sell-stock" },
    { id: 13, title: "Kth Largest Element in an Array", tag: "Heap", duration: "15–20m", likes: 1450, difficulty: "Intermediate", startHref: "/problems/kth-largest-element-in-an-array" },
    { id: 14, title: "Course Schedule", tag: "Topological Sort", duration: "20–30m", likes: 1235, difficulty: "Intermediate", startHref: "/problems/course-schedule" },
    { id: 15, title: "Coin Change", tag: "Dynamic Programming", duration: "30–40m", likes: 890, difficulty: "Advanced", startHref: "/problems/coin-change" },
    { id: 16, title: "Subsets", tag: "Backtracking", duration: "15–25m", likes: 1120, difficulty: "Beginner", startHref: "/problems/subsets" },
    { id: 17, title: "Minimum Window Substring", tag: "Sliding Window", duration: "25–35m", likes: 1575, difficulty: "Advanced", startHref: "/problems/minimum-window-substring" },
    { id: 18, title: "Add Two Numbers", tag: "Linked List", duration: "15–20m", likes: 4020, difficulty: "Beginner", startHref: "/problems/add-two-numbers" },
    { id: 19, title: "Word Search", tag: "Backtracking", duration: "20–30m", likes: 980, difficulty: "Intermediate", startHref: "/problems/word-search" },
    { id: 20, title: "Bitwise AND of Numbers Range", tag: "Bit Manipulation", duration: "15–25m", likes: 470, difficulty: "Advanced", startHref: "/problems/bitwise-and-of-numbers-range" },
  ];

  return (
    <div>
      <h1>Learn</h1>
      <main style={{ padding: 32 }}></main>


      <ProblemsGrid items={problems} initialCount={12} pageSize={12} />
      
    </div>
  );
}
