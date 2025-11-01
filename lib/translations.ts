export type Locale = "en" | "es";

type TranslationLeaf = string;

interface TranslationTree {
  [key: string]: TranslationLeaf | TranslationTree;
}

export const translations: Record<Locale, TranslationTree> = {
  en: {
    app: {
      name: "FinCafé",
      tagline: "Coffee Farm Administration",
      navigation: {
        home: "Home",
      },
      hero: {
        title: "Initial role definition",
        description:
          "We begin by describing the three core profiles that will operate the FinCafé platform. These roles define the scope of permissions and responsibilities within the system and will guide upcoming authentication and user management modules.",
      },
      roadmap: {
        title: "Next steps",
        description:
          "We will integrate authentication, operational dashboards, and workflows to assign tasks according to each role. This view acts as the initial roadmap for the application's capabilities.",
      },
      languageLabel: "Language",
      roleLabel: "Role",
      roleSectionTitle: "Key responsibilities",
    },
    roles: {
      administrator: {
        title: "Administrator",
        summary:
          "Oversees the farm's overall operation and ensures processes work in a coordinated manner.",
        responsibilities: {
          userAccess: "Manage users and assign access permissions.",
          reporting: "Define indicators and reports to track business performance.",
          planning: "Configure seasons, plots, and production plans.",
        },
      },
      owner: {
        title: "Owner",
        summary:
          "Focuses on strategic vision, investments, and the profitability of the coffee farm.",
        responsibilities: {
          performance: "Review financial performance and productivity.",
          approvals: "Authorize relevant investments, purchases, or sales.",
          goals: "Monitor progress toward long-term objectives.",
        },
      },
      employee: {
        title: "Employee",
        summary:
          "Executes assigned operational tasks to keep the farm running day to day.",
        responsibilities: {
          logs: "Update logs for agricultural work and harvest activities.",
          incidents: "Report issues related to crops, machinery, or inventory.",
          coordination: "Coordinate with supervisors to prioritize activities.",
        },
      },
    },
  },
  es: {
    app: {
      name: "FinCafé",
      tagline: "Administración de fincas cafeteras",
      navigation: {
        home: "Inicio",
      },
      hero: {
        title: "Definición inicial de roles",
        description:
          "Empezamos por describir los tres perfiles fundamentales que operarán la plataforma FinCafé. Estos roles definen el alcance de permisos y responsabilidades dentro del sistema y servirán como base para los módulos de autenticación y gestión de usuarios.",
      },
      roadmap: {
        title: "Próximos pasos",
        description:
          "Integraremos autenticación, tableros operativos y flujos de trabajo para asignar tareas según el rol. Esta vista sirve como hoja de ruta inicial para las capacidades de la aplicación.",
      },
      languageLabel: "Idioma",
      roleLabel: "Rol",
      roleSectionTitle: "Responsabilidades clave",
    },
    roles: {
      administrator: {
        title: "Administrador",
        summary:
          "Supervisa la operación global de la finca y garantiza que los procesos funcionen de forma coordinada.",
        responsibilities: {
          userAccess: "Gestionar usuarios y asignar permisos de acceso.",
          reporting: "Definir indicadores y reportes para el seguimiento del negocio.",
          planning: "Configurar temporadas, lotes y planes de producción.",
        },
      },
      owner: {
        title: "Propietario",
        summary:
          "Se enfoca en la visión estratégica, inversiones y la rentabilidad de la finca cafetera.",
        responsibilities: {
          performance: "Revisar el rendimiento financiero y la productividad.",
          approvals: "Autorizar inversiones, compras o ventas relevantes.",
          goals: "Monitorear el cumplimiento de objetivos de largo plazo.",
        },
      },
      employee: {
        title: "Empleado",
        summary:
          "Ejecuta tareas operativas asignadas para mantener la finca en funcionamiento diario.",
        responsibilities: {
          logs: "Actualizar bitácoras de labores agrícolas y cosecha.",
          incidents: "Reportar incidencias en cultivos, maquinaria o inventarios.",
          coordination: "Coordinarse con supervisores para priorizar actividades.",
        },
      },
    },
  },
};

export const availableLocales: Locale[] = ["en", "es"];
