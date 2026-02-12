import { ChevronRight, ChevronUp } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { RoutePath } from "@/types/routes";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/animate-ui/components/radix/sidebar";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/animate-ui/primitives/base/collapsible";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SidebarItemBase = {
  title: string;
  icon: React.ComponentType<React.ComponentProps<"svg">>;
};

type SidebarItemLink = SidebarItemBase & {
  collapsible?: false;
  url: RoutePath;
};

type SidebarItemCollapsibleChild = {
  component: React.ReactNode;
  title: string;
};

type SidebarItemCollapsible = SidebarItemBase & {
  collapsible: true;
  children: Array<SidebarItemCollapsibleChild>;
};

type SidebarItem = SidebarItemLink | SidebarItemCollapsible;

export type SidebarItems = ReadonlyArray<SidebarItem>;

function CollapsibleItem({ item }: { item: SidebarItemCollapsible }) {
  const { state, isMobile } = useSidebar();
  const [open, setOpen] = useState(false);
  const isCollapsed = state === "collapsed" && !isMobile;

  useEffect(() => {
    if (isCollapsed) {
      setOpen(false);
    }
  }, [isCollapsed]);

  if (isCollapsed) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton tooltip={item.title}>
              <item.icon />
              <span>{item.title}</span>
              <ChevronRight className="ml-auto opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-48 rounded-lg">
            <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {item.children.map((child) => (
              <DropdownMenuItem key={child.title} asChild>
                {child.component}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible key={item.title} open={open} onOpenChange={setOpen}>
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip={item.title}>
          <CollapsibleTrigger>
            <item.icon />
            <span>{item.title}</span>
            <ChevronUp
              className={cn(
                "ml-auto transition-transform duration-200",
                open ? "rotate-0" : "rotate-180",
              )}
            />
          </CollapsibleTrigger>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <CollapsiblePanel className="w-full">
        <SidebarGroupContent className="w-full">
          {item.children.map((child) => (
            <SidebarMenuItem key={child.title} className="w-full">
              <SidebarMenuButton asChild className="w-full">
                {child.component}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarGroupContent>
      </CollapsiblePanel>
    </Collapsible>
  );
}

interface AppSidebarProps {
  renderTrigger: boolean;
  baseUrl: RoutePath;
  footer?: ReactNode;
  items: (baseUrl: RoutePath) => ReadonlyArray<SidebarItem>;
  handleTransitionEnd?: (event: React.TransitionEvent<HTMLDivElement>) => void;
}

export function AppSidebar({
  renderTrigger,
  baseUrl,
  footer,
  items,
  handleTransitionEnd,
}: Readonly<AppSidebarProps>) {
  return (
    <Sidebar
      collapsible="icon"
      className="**:overflow-y-hidden **:overflow-x-hidden border-r-0"
      onTransitionEnd={handleTransitionEnd}
    >
      <SidebarContent className="border-r-0">
        <SidebarGroup>
          <SidebarGroupLabel>HealFlow</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderTrigger && (
                <SidebarMenuItem>
                  <SidebarTrigger />
                </SidebarMenuItem>
              )}
              {items(baseUrl).map((item) =>
                item.collapsible ? (
                  <CollapsibleItem key={item.title} item={item} />
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {footer && <SidebarFooter className="p-1">{footer}</SidebarFooter>}
      <SidebarRail />
    </Sidebar>
  );
}
