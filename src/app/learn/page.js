'use client';
import React from 'react';
import ProblemsGrid from "../../components/Box/ProblemsGrid";
import { useEffect, useState } from 'react';

export default function Learn() {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    // Fetch problems from the backend API
    const fetchProblems = async () => {
      try {
        const response = await fetch('/api/questions/QuestionsMetaData');
        const data = await response.json();
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };

    // Call the async function without 'await' because useEffect callback cannot be async
    fetchProblems();
    console.log("Fetched problems", problems);

  
  }, []);


  

  return (
    <div>
      <h1>Learn</h1>
      <main style={{ padding: 32 }}></main>


      <ProblemsGrid items={problems} initialCount={12} pageSize={12} />
      
    </div>
  );
}
