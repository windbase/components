import './index.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ComponentBuilder } from './components/ComponentBuilder';
import { ComponentEditor } from './components/ComponentEditor';

export function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<ComponentBuilder />} />
				<Route
					path="/edit/blocks/:id"
					element={<ComponentEditor type="blocks" />}
				/>
				<Route
					path="/edit/templates/:id"
					element={<ComponentEditor type="templates" />}
				/>
			</Routes>
		</Router>
	);
}

export default App;
