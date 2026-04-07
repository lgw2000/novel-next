"use client";

import { usePathname, useRouter } from "next/navigation";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";
import {
  NavList,
  NavItem,
  NavLink,
  NavButton,
  NavIcon,
  NavLabel,
  SidebarDivider,
  EmptyState,
  SidebarTitle as BaseSidebarTitle,
} from "./SidebarStyles";
import { useSidebarContext } from "./SidebarContext";
import { SidebarSearch } from "./SidebarSearch";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const SidebarTitle = styled(BaseSidebarTitle)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SearchToggleButton = styled.button`
  background: transparent;
  border: none;
  color: ${(props) => props.theme.textSecondary};
  cursor: pointer;
  font-size: 1.4rem;
  padding: 0.4rem;
  border-radius: 0.4rem;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme.surfaceHover};
    color: ${(props) => props.theme.textPrimary};
  }
`;

interface Board {
  id: string;
  name: string;
}

interface CustomLink {
  id: string;
  label: string;
  url: string;
}

interface BoardListSidebarProps {
  boards: Board[];
  customLinks?: CustomLink[];
  title?: string;
  emptyMessage?: string;
  manualLabel?: string;
  searchOnly?: boolean;
}

const ManualLinkContent = styled.span`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const ManualIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  font-size: 1.4rem;
`;

const ExternalNavLink = styled.a`
  display: block;
  padding: 1rem 1.2rem;
  border-radius: 0.6rem;
  text-decoration: none;
  font-size: 1.4rem;
  color: ${(props) => props.theme.textSecondary};
  background: transparent;
  font-weight: 400;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: ${(props) => props.theme.surfaceHover};
    color: ${(props) => props.theme.textPrimary};
  }
`;

import { SidebarChapters } from "./SidebarChapters";

export function BoardListSidebar({
  boards,
  customLinks,
  title = "Boards",
  emptyMessage = "No boards",
  manualLabel = "Manual",
  searchOnly = false,
}: BoardListSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, setMode } = useSidebarContext();
  const isManualActive = pathname === "/manual";

  const handleSearchClick = () => {
    router.push("/search");
  };

  if (mode === "search") {
    return <SidebarSearch />;
  }

  if (mode === "chapters") {
    return <SidebarChapters />;
  }

  if (searchOnly) {
    return (
      <div style={{ padding: "0 1.2rem" }}>
        <NavList>
          <NavItem>
            <NavButton onClick={handleSearchClick}>
              <NavIcon>
                <FontAwesomeIcon icon={faSearch} />
              </NavIcon>
              <NavLabel>소설 검색</NavLabel>
            </NavButton>
          </NavItem>
        </NavList>
      </div>
    );
  }

  return (
    <div>
      <NavList>
        <NavItem>
          <NavLink href="/manual" $active={isManualActive}>
            <ManualLinkContent>
              <ManualIcon>
                <FontAwesomeIcon icon={faBook} />
              </ManualIcon>
              {manualLabel}
            </ManualLinkContent>
          </NavLink>
        </NavItem>
      </NavList>
      <SidebarDivider />
      <SidebarTitle>
        {title}
        <SearchToggleButton onClick={handleSearchClick} aria-label="Search">
          <FontAwesomeIcon icon={faSearch} />
        </SearchToggleButton>
      </SidebarTitle>
      {boards.length === 0 ? (
        <EmptyState>{emptyMessage}</EmptyState>
      ) : (
        <NavList>
          {boards.map((board) => {
            const href = `/index/${board.id}`;
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <NavItem key={board.id}>
                <NavLink href={href} $active={isActive}>
                  {board.name}
                </NavLink>
              </NavItem>
            );
          })}
        </NavList>
      )}
      {customLinks && customLinks.length > 0 && (
        <>
          <SidebarDivider />
          <NavList>
            {customLinks.map((link) => (
              <NavItem key={link.id}>
                <ExternalNavLink
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </ExternalNavLink>
              </NavItem>
            ))}
          </NavList>
        </>
      )}
    </div>
  );
}
