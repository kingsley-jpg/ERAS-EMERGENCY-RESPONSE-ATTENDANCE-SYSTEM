/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Facility {
  id: string;
  name: string;
  category: 'Hospital' | 'Clinic' | 'Pharmacy' | 'Emergency Centre' | 'Diagnostic & Lab';
  address: string;
  city: string;
  region: string;
  lat: number;
  lon: number;
  phone?: string;
  emergency24_7: boolean;
  nhisAccredited: boolean;
  services?: string[];
  distanceKm?: number;
}

export interface EmergencyContact {
  id: string;
  title: string;
  agency: string;
  number: string;
  altNumber?: string;
  region: string;
  description: string;
  badge: 'National' | 'Regional' | 'Specialist';
}

export interface FirstAidGuide {
  id: string;
  title: string;
  category: string;
  severity: 'Immediate Danger' | 'Urgent' | 'Standard';
  summary: string;
  dos: string[];
  donts: string[];
  steps: { step: number; instruction: string; detail: string }[];
  emergencyTip: string;
}

export interface HealthUpdate {
  id: string;
  title: string;
  source: string;
  date: string;
  category: 'Alert' | 'Advisory' | 'Public Health' | 'Vaccination';
  summary: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  isEmergency?: boolean;
  source?: 'gemini' | 'fallback';
}

export type PageTab = 'home' | 'search' | 'chat' | 'dispatch' | 'firstaid' | 'hotlines' | 'updates';
