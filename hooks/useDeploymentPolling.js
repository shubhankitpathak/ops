// src/hooks/useDeploymentPolling.js
import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Smart polling hook for deployment status
 * - Queued: Poll every 15 seconds
 * - In Progress: Poll every 10 seconds
 * - Completed/Failed ...stop polling 
 */
export function useDeploymentPolling(projectId) {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const intervalRef = useRef(null);
  
  const fetchDeployments = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      const res = await fetch(`/api/projects/${projectId}/deployments`);
      if (!res.ok) throw new Error("Failed to fetch deployments");
      
      const data = await res.json();
      setDeployments(data.deployments || []);
      setFromCache(data.fromCache);
      setError(null);
      
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [projectId]);
  
  // Initial fetch
  useEffect(() => {
    fetchDeployments();
  }, [fetchDeployments]);
  
  // Smart polling
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (deployments.length === 0) return;
    
    // Check latest deployment status
    const latest = deployments[0];
    const isActive = latest.status === 'queued' || latest.status === 'in_progress';
    
    if (isActive) {
      // Determine polling interval
      const interval = latest.status === 'queued' ? 15000 : 10000; // 15s or 10s
      
      console.log(`📡 Starting polling (${interval/1000}s) for ${latest.status} deployment`);
      
      intervalRef.current = setInterval(() => {
        fetchDeployments(false); // Don't show loading on background fetches
      }, interval);
    } else {
      console.log(`✅ Deployment ${latest.conclusion || 'completed'} - stopping polling`);
    }
    
    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [deployments, fetchDeployments]);
  
  const refresh = useCallback(() => {
    return fetchDeployments(true);
  }, [fetchDeployments]);
  
  return {
    deployments,
    loading,
    error,
    fromCache,
    refresh,
  };
}
