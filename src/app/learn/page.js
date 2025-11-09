'use client';
import React from 'react';
import ProblemsGrid from "../../components/Box/ProblemsGrid";
import { useEffect, useState } from 'react';
import Navbar from "../../components/navbar/navbar";

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
      <Navbar />
      <main style={{ marginLeft: "6rem", padding: "2rem" }}>
        <h1>Learn</h1>
        <ProblemsGrid items={problems} initialCount={12} pageSize={12} />
      </main>
    </div>
  );
}

