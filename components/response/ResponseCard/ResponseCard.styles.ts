"use client";

import styled from "styled-components";

export const Card = styled.div<{ $variant?: "main" | "anchor" }>`
  background: transparent;
  border-bottom: 1px dashed ${(props) => props.theme.surfaceBorder};
  padding-bottom: 2rem;
  margin-bottom: 2rem;
`;

export const Header = styled.div`
  padding: 0.5rem 1rem;
  opacity: 0.7;
  display: flex;
  justify-content: space-between;
`;

export const Info = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1.4rem;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;

  @media (max-width: ${(props) => props.theme.breakpoint}) {
    gap: 0.2rem;
  }
`;

export const Seq = styled.span`
  color: ${(props) => props.theme.textSecondary};
  font-weight: 500;
  cursor: pointer;

  &:hover {
    color: ${(props) => props.theme.textPrimary};
  }
`;

export const Username = styled.span<{ $clickable?: boolean }>`
  color: ${(props) => props.theme.textPrimary};
  font-weight: 500;
  word-break: break-all;
  cursor: ${(props) => (props.$clickable ? "pointer" : "default")};

  &:hover {
    text-decoration: ${(props) => (props.$clickable ? "underline" : "none")};
  }
`;

export const AuthorId = styled.span<{ $clickable?: boolean }>`
  color: ${(props) => props.theme.textSecondary};
  cursor: ${(props) => (props.$clickable ? "pointer" : "default")};

  &:hover {
    text-decoration: ${(props) => (props.$clickable ? "underline" : "none")};
  }
`;

export const Date = styled.span`
  color: ${(props) => props.theme.textSecondary};
  font-size: 1.2rem;
  flex-basis: 100%;
  order: 1;
`;

export const Content = styled.div`
  padding: 1rem 2rem;
  font-size: 1.7rem;
  line-height: 1.9;
  letter-spacing: 0.05rem;
  color: ${(props) => props.theme.textPrimary};
  word-break: break-word;

  /* TOM styles */
  hr {
    border: none;
    border-top: 1px solid ${(props) => props.theme.surfaceBorder};
    margin: 1.6rem 0;
  }
`;

export const RawContentDisplay = styled.span`
  white-space: pre-wrap;
`;

export const Attachment = styled.div`
  padding: 1.6rem 1.6rem 0;
`;
