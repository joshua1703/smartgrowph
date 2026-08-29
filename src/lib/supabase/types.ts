export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "operator" | "viewer" | "technician";
export type UserStatus = "active" | "inactive" | "suspended";
export type GrowthStage = "inoculation" | "incubation" | "primordia" | "fruiting" | "harvest" | "completed";
export type SensorStatus = "normal" | "warning" | "critical";
export type ActuatorType = "fan" | "fogger" | "sprinkler" | "led";
export type ActuatorStatus = "normal" | "warning" | "error" | "maintenance";
export type ActuatorAction = "activated" | "deactivated" | "error" | "maintenance";
export type ActuatorTrigger = "auto" | "manual" | "schedule" | "emergency";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          status: UserStatus;
          avatar: string | null;
          avatar_gradient: string | null;
          zone: string | null;
          last_active: string | null;
          sessions_today: number;
          actions_this_week: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          status?: UserStatus;
          avatar?: string | null;
          avatar_gradient?: string | null;
          zone?: string | null;
          last_active?: string | null;
          sessions_today?: number;
          actions_this_week?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: UserRole;
          status?: UserStatus;
          avatar?: string | null;
          avatar_gradient?: string | null;
          zone?: string | null;
          last_active?: string | null;
          sessions_today?: number;
          actions_this_week?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sensor_readings: {
        Row: {
          id: string;
          sensor_id: string;
          sensor_name: string;
          zone: string;
          temperature: number;
          humidity: number;
          soil_moisture: number;
          co2_level: number;
          light_intensity: number;
          status: SensorStatus;
          created_at: string;
        };
        Insert: {
          id: string;
          sensor_id: string;
          sensor_name: string;
          zone: string;
          temperature: number;
          humidity: number;
          soil_moisture: number;
          co2_level: number;
          light_intensity: number;
          status?: SensorStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          sensor_id?: string;
          sensor_name?: string;
          zone?: string;
          temperature?: number;
          humidity?: number;
          soil_moisture?: number;
          co2_level?: number;
          light_intensity?: number;
          status?: SensorStatus;
          created_at?: string;
        };
        Relationships: [];
      };
      growth_batches: {
        Row: {
          id: string;
          user_id: string | null;
          batch_name: string;
          substrate: string;
          variety: string;
          zone: string;
          start_date: string;
          current_stage: GrowthStage;
          days_since_start: number;
          estimated_harvest_date: string | null;
          progress: number;
          yield: number | null;
          expected_yield: number;
          health_score: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id?: string | null;
          batch_name: string;
          substrate: string;
          variety: string;
          zone: string;
          start_date?: string;
          current_stage?: GrowthStage;
          days_since_start?: number;
          estimated_harvest_date?: string | null;
          progress?: number;
          yield?: number | null;
          expected_yield?: number;
          health_score?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          batch_name?: string;
          substrate?: string;
          variety?: string;
          zone?: string;
          start_date?: string;
          current_stage?: GrowthStage;
          days_since_start?: number;
          estimated_harvest_date?: string | null;
          progress?: number;
          yield?: number | null;
          expected_yield?: number;
          health_score?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "growth_batches_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      daily_growth_logs: {
        Row: {
          id: string;
          batch_id: string;
          date: string;
          height: number;
          cap_diameter: number;
          primordia_density: number;
          moisture_level: number;
          contamination: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          batch_id: string;
          date?: string;
          height?: number;
          cap_diameter?: number;
          primordia_density?: number;
          moisture_level?: number;
          contamination?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          batch_id?: string;
          date?: string;
          height?: number;
          cap_diameter?: number;
          primordia_density?: number;
          moisture_level?: number;
          contamination?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "daily_growth_logs_batch_id_fkey";
            columns: ["batch_id"];
            isOneToOne: false;
            referencedRelation: "growth_batches";
            referencedColumns: ["id"];
          }
        ];
      };
      actuators: {
        Row: {
          id: string;
          name: string;
          type: ActuatorType;
          zone: string;
          is_active: boolean;
          status: ActuatorStatus;
          watt_base: number;
          last_toggled_at: string | null;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          type: ActuatorType;
          zone: string;
          is_active?: boolean;
          status?: ActuatorStatus;
          watt_base?: number;
          last_toggled_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: ActuatorType;
          zone?: string;
          is_active?: boolean;
          status?: ActuatorStatus;
          watt_base?: number;
          last_toggled_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      actuator_logs: {
        Row: {
          id: string;
          actuator_id: string;
          actuator_name: string;
          actuator_type: ActuatorType;
          zone: string;
          action: ActuatorAction;
          trigger: ActuatorTrigger;
          duration: number | null;
          reason: string;
          power_consumption: number;
          created_at: string;
        };
        Insert: {
          id: string;
          actuator_id: string;
          actuator_name: string;
          actuator_type: ActuatorType;
          zone: string;
          action: ActuatorAction;
          trigger: ActuatorTrigger;
          duration?: number | null;
          reason: string;
          power_consumption?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          actuator_id?: string;
          actuator_name?: string;
          actuator_type?: ActuatorType;
          zone?: string;
          action?: ActuatorAction;
          trigger?: ActuatorTrigger;
          duration?: number | null;
          reason?: string;
          power_consumption?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      device_automations: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          device: string;
          condition_type: string;
          operator: string;
          threshold: number;
          action: string;
          is_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          device: string;
          condition_type: string;
          operator: string;
          threshold: number;
          action: string;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          device?: string;
          condition_type?: string;
          operator?: string;
          threshold?: number;
          action?: string;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      device_schedules: {
        Row: {
          id: string;
          user_id: string | null;
          device: string;
          start_time: string;
          end_time: string;
          days: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          device: string;
          start_time: string;
          end_time: string;
          days?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          device?: string;
          start_time?: string;
          end_time?: string;
          days?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      system_settings: {
        Row: {
          id: string;
          user_id: string | null;
          auto_mode: boolean;
          temp_target: number;
          humidity_target: number;
          co2_threshold: number;
          email_alerts: boolean;
          push_alerts: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          auto_mode?: boolean;
          temp_target?: number;
          humidity_target?: number;
          co2_threshold?: number;
          email_alerts?: boolean;
          push_alerts?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          auto_mode?: boolean;
          temp_target?: number;
          humidity_target?: number;
          co2_threshold?: number;
          email_alerts?: boolean;
          push_alerts?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      requesting_user_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
