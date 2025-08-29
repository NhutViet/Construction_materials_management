// Module declarations for packages without types

declare module '@iconscout/react-unicons/icons/*' {
  const Icon: React.ComponentType<any>;
  export default Icon;
}

declare module '*.js' {
  const content: any;
  export default content;
}

declare module '*.jsx' {
  const content: any;
  export default content;
}
