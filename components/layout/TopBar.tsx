"use client";

import { useEffect, useRef, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import { HomeButton } from "./HomeButton";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { SettingsButton } from "./SettingsButton";
import { AdminButton } from "./AdminButton";
import { AuthButton } from "./AuthButton";
import { MyPageButton } from "./MyPageButton";
import { UserCounter } from "./UserCounter";
import Link from "next/link";

const Bar = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 5.6rem;
  background: ${(props) => props.theme.topBar}ee; /* Slightly transparent for blur */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  padding: 0 1.6rem;
  z-index: 1000;
  border-bottom: 1px solid ${(props) => props.theme.surfaceBorder};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 8rem;
  height: 3.6rem;
  padding: 0 1.2rem;
  border: 1px solid ${(props) => props.theme.surfaceBorder};
  background: ${(props) => props.theme.surface}40;
  border-radius: 1rem;
  cursor: pointer;
  color: ${(props) => props.theme.topBarText};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    background: ${(props) => props.theme.primary}20;
    border-color: ${(props) => props.theme.primary};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${(props) => props.theme.primary}30;
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 2rem;
    height: 2rem;
    transition: transform 0.2s;
  }

  &:hover svg {
    transform: scale(1.1);
  }

  &::after {
    content: "MENU";
    font-size: 1.1rem;
    font-weight: 800;
    margin-left: 0.8rem;
    letter-spacing: 0.1em;
    color: ${(props) => props.theme.primary};
  }
`;

const TitleWrapper = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  margin-left: 1.2rem;
  margin-right: 1.2rem;
`;

const scrollLeft = keyframes`
  0% {
    transform: translateX(0);
  }
  80% {
    transform: translateX(var(--scroll-amount));
  }
  100% {
    transform: translateX(var(--scroll-amount));
  }
`;

const reset = keyframes`
  0% {
    transform: translateX(var(--scroll-amount));
  }
  100% {
    transform: translateX(0);
  }
`;

const TitleText = styled.div<{ $animate: boolean }>`
  display: inline-block;
  font-size: 1.8rem;
  font-weight: 600;
  color: ${(props) => props.theme.topBarText};
  white-space: nowrap;
  will-change: transform;

  ${({ $animate }) =>
    $animate &&
    css`
      animation:
        ${scrollLeft} 4s linear 0s 1 forwards,
        ${reset} 0.5s ease 4.5s 1 forwards;
    `}
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;

  @media (max-width: ${(props) => props.theme.breakpoint}) {
    gap: 0.4rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
`;

interface TopBarProps {
  title?: string;
  onMenuClick: () => void;
  isLoggedIn: boolean;
  canAccessAdmin: boolean;
  authLabels: { login: string; logout: string };
  isHomePage?: boolean;
  isSettingsPage?: boolean;
  isAdminPage?: boolean;
  isMyPage?: boolean;
  userCount?: number;
  userCountTitle?: string;
}

function MarqueeTitle({ title }: { title: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    let timeout: NodeJS.Timeout;

    const evaluateOverflow = () => {
      const scrollDistance = content.scrollWidth - wrapper.clientWidth;

      if (scrollDistance > 0) {
        content.style.setProperty("--scroll-amount", `-${scrollDistance}px`);
        if (!animate) {
          startAnimationLoop();
        }
      } else {
        stopAnimation();
      }
    };

    const startAnimationLoop = () => {
      setAnimate(true);
      timeout = setTimeout(() => {
        setAnimate(false);
        timeout = setTimeout(() => {
          evaluateOverflow();
        }, 2000);
      }, 5000);
    };

    const stopAnimation = () => {
      clearTimeout(timeout);
      setAnimate(false);
    };

    evaluateOverflow();

    const observer = new ResizeObserver(() => {
      evaluateOverflow();
    });

    observer.observe(wrapper);
    observer.observe(content);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [title]);

  return (
    <TitleWrapper ref={wrapperRef}>
      <TitleText ref={contentRef} $animate={animate}>
        {title}
      </TitleText>
    </TitleWrapper>
  );
}

export function TopBar({
  title,
  onMenuClick,
  isLoggedIn,
  canAccessAdmin,
  authLabels,
  isHomePage,
  isSettingsPage,
  isAdminPage,
  isMyPage,
  userCount,
  userCountTitle,
}: TopBarProps) {
  return (
    <Bar>
      <MenuButton onClick={onMenuClick} aria-label="Toggle menu">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </MenuButton>
      {title && <MarqueeTitle title={title} />}
      <RightSection>
        {userCount !== undefined && (
          <UserCounter count={userCount} title={userCountTitle} />
        )}
        <ButtonGroup>
          <HomeButton active={isHomePage} />
          <ThemeToggleButton />
          <MyPageButton active={isMyPage} />
          <SettingsButton active={isSettingsPage} />
          {canAccessAdmin && <AdminButton active={isAdminPage} />}
        </ButtonGroup>
        <AuthButton
          isLoggedIn={isLoggedIn}
          loginLabel={authLabels.login}
          logoutLabel={authLabels.logout}
        />
      </RightSection>
    </Bar>
  );
}
