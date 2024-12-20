'use client';
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Bot, CreditCard, GithubIcon, LayoutDashboard, Plus, Presentation } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useProject from "@/hooks/use-project";

const items = [
    {
        title: "Dashboard",
        url: '/dashboard',
        icon: LayoutDashboard
    },
    {
        title: "Q&A",
        url: '/qa',
        icon: Bot
    },
    {
        title: "Meetings",
        url: '/meetings',
        icon: Presentation
    },
    {
        title: "Billing",
        url: '/billing',
        icon: CreditCard
    }
]

const AppSidebar = () => {
    const pathname = usePathname();
    const { open } = useSidebar();
    const { projects, projectId, setProjectId } = useProject();
    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <div className="flex gap-2 items-center">
                    <GithubIcon className="bg-black text-white rounded-full p-1" size={30}/>
                    {open && <span className="font-semibold text-lg">Github AI</span>}
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => {
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Link href={item.url} className={cn({
                                                '!bg-primary !text-white': pathname === item.url
                                            })}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {projects?.map((project) => {
                                return (
                                    <SidebarMenuItem key={project.name}>
                                        <SidebarMenuButton asChild>
                                            <div onClick={() => {
                                                setProjectId(project.id);
                                            }} className="cursor-pointer">
                                                <div className={cn(
                                                    'rounded-sm size-7 border px-3 -ml-1.5 flex items-center justify-center text-sm bg-white text-primary',
                                                    {
                                                        'bg-primary text-white': project.id === projectId

                                                    }
                                                )}>
                                                    {project.name[0]}
                                                </div>
                                                {open && <span>{project.name}</span>}
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                            <div className="h-2"></div>
                            {open && (
                                <SidebarMenuItem>
                                    <Link href='/create'>
                                        <Button size={'sm'} variant={'outline'} className="w-fit">
                                            <Plus />
                                            <span>Create Project</span>
                                        </Button>
                                    </Link>
                                </SidebarMenuItem>
                            ) }
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}

export default AppSidebar;