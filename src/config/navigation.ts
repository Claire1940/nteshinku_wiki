import { BookOpen, Hammer, Zap, Users, Package, CalendarClock, Shirt } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavigationItem {
	key: string // 用于翻译键，如 'codes' -> t('nav.codes')
	path: string // URL 路径，如 '/codes'
	icon: LucideIcon // Lucide 图标组件
	isContentType: boolean // 是否对应 content/ 目录
}

// NTE Shinku 角色站 7 个内容分类（与 content/<lang>/ 目录一一对应）
export const NAVIGATION_CONFIG: NavigationItem[] = [
	{ key: 'guide', path: '/guide', icon: BookOpen, isContentType: true },
	{ key: 'build', path: '/build', icon: Hammer, isContentType: true },
	{ key: 'kit', path: '/kit', icon: Zap, isContentType: true },
	{ key: 'team', path: '/team', icon: Users, isContentType: true },
	{ key: 'materials', path: '/materials', icon: Package, isContentType: true },
	{ key: 'banner', path: '/banner', icon: CalendarClock, isContentType: true },
	{ key: 'cosmetics', path: '/cosmetics', icon: Shirt, isContentType: true },
]

// 从配置派生内容类型列表（用于路由和内容加载）
export const CONTENT_TYPES = NAVIGATION_CONFIG.filter((item) => item.isContentType).map(
	(item) => item.path.slice(1),
) // 移除开头的 '/' -> ['codes', 'build', 'combat', 'guides']

export type ContentType = (typeof CONTENT_TYPES)[number]

// 辅助函数：验证内容类型
export function isValidContentType(type: string): type is ContentType {
	return CONTENT_TYPES.includes(type as ContentType)
}
