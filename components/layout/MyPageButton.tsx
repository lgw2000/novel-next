"use client";

import Link from "next/link";
import styled from "styled-components";

const Button = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 0.8rem;
  color: ${(props) => props.theme.topBarText};
  opacity: ${(props) => (props.$active ? 1 : 0.8)};
  background: ${(props) => (props.$active ? props.theme.topBarHover : "transparent")};
  transition: background 0.15s, opacity 0.15s;

  &:hover {
    background: ${(props) => props.theme.topBarHover};
    opacity: 1;
  }

  svg {
    width: 2.2rem;
    height: 2.2rem;
  }
`;

interface MyPageButtonProps {
  active?: boolean;
}

export function MyPageButton({ active }: MyPageButtonProps) {
  return (
    <Button href="/mypage" aria-label="My Page" $active={active}>
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
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    </Button>
  );
}
