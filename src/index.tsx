import { serve } from 'bun';
import index from './index.html';
import { componentManager } from './utils/componentManager';

const server = serve({
	routes: {
		// Serve index.html for all unmatched routes.
		'/*': index,

		'/api/components': {
			async GET(req) {
				try {
					const url = new URL(req.url);
					const page = parseInt(url.searchParams.get('page') || '1');
					const limit = parseInt(url.searchParams.get('limit') || '12');
					const type = url.searchParams.get('type') || 'all';

					const result = await componentManager.loadComponents(
						page,
						limit,
						type
					);
					return Response.json({ success: true, ...result });
				} catch (error) {
					return Response.json(
						{ success: false, error: error.message },
						{ status: 500 }
					);
				}
			},
			async POST(req) {
				try {
					const component = await req.json();
					const success = await componentManager.createComponent(component);
					return Response.json({ success, data: component });
				} catch (error) {
					return Response.json(
						{ success: false, error: error.message },
						{ status: 500 }
					);
				}
			}
		},

		'/api/components/:id': {
			async PUT(req) {
				try {
					const id = req.params.id;
					const body = await req.json();
					const { component, nameChanged } = body;
					const success = await componentManager.updateComponent(
						id,
						component,
						nameChanged
					);
					return Response.json({ success, data: component });
				} catch (error) {
					return Response.json(
						{ success: false, error: error.message },
						{ status: 500 }
					);
				}
			},
			async DELETE(req) {
				try {
					const id = req.params.id;
					const success = await componentManager.deleteComponent(id);
					return Response.json({ success });
				} catch (error) {
					return Response.json(
						{ success: false, error: error.message },
						{ status: 500 }
					);
				}
			}
		}
	},

	development: process.env.NODE_ENV !== 'production'
});

console.log(`🚀 Server running at ${server.url}`);
