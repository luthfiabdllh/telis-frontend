import type { ReactNode } from "react";
import { 
  HomeIcon, 
  ShieldCheckIcon, 
  ArchiveIcon, 
  FileTextIcon, 
  BarChart3Icon, 
  PieChartIcon,
  FlagIcon
} from "lucide-react";

export type SidebarNavItem = {
	title: string;
	path?: string;
	icon?: ReactNode;
	isActive?: boolean;
	subItems?: SidebarNavItem[];
    roles?: string[]; // Optional role protection
};

export type SidebarNavGroup = {
	label: string;
	items: SidebarNavItem[];
};

export const navGroups: SidebarNavGroup[] = [
	{
		label: "Menu Utama",
		items: [
			{
				title: "Beranda",
				path: "/dashboard",
				icon: <HomeIcon />,
				isActive: true,
			},
			{
				title: "Obrolan AI",
				path: "/dashboard/chat",
				icon: <ShieldCheckIcon />,
			},
			{
				title: "Repositori Dokumen",
				path: "/dashboard/documents",
				icon: <ArchiveIcon />,
			},
			{
				title: "Analisis Redline",
				path: "/dashboard/redlining",
				icon: <FileTextIcon />,
			},
			{
				title: "Statistik Token Saya",
				path: "/dashboard/metrics",
				icon: <BarChart3Icon />,
			},
			{
				title: "Dashboard Analytics",
				path: "/dashboard/analytics",
				icon: <PieChartIcon />,
			},
		],
	},
	{
		label: "Administrator",
		items: [
			{
				title: "Pengelolaan Pengguna",
				path: "/dashboard/admin/users",
				icon: <FlagIcon />,
                roles: ["Admin", "Legal"],
			},
			{
				title: "Laporan Pemakaian",
				path: "/dashboard/admin/metrics",
				icon: <BarChart3Icon />,
                roles: ["Admin"],
			},
		],
	},
];

export const footerNavLinks: SidebarNavItem[] = [];

export const navLinks: SidebarNavItem[] = [
	...navGroups.flatMap((group) =>
		group.items.flatMap((item) =>
			item.subItems?.length ? [item, ...item.subItems] : [item]
		)
	),
	...footerNavLinks,
];
