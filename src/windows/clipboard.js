export default { setString: value => navigator.clipboard.writeText(value), getString: () => navigator.clipboard.readText() };
