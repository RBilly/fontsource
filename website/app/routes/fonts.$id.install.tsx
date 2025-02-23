import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';

import { Install } from '@/components/preview/Install';
import { TabsWrapper } from '@/components/preview/Tabs';
import { ogMeta } from '@/utils/meta';
import { getMetadata, getStats, getVariable } from '@/utils/metadata.server';
import type { Metadata, VariableData } from '@/utils/types';

interface FontMetadata {
	metadata: Metadata;
	variable?: VariableData;
	downloadCount: number;
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const { id } = params;
	invariant(id, 'Missing font ID!');

	const metadata = await getMetadata(id);
	const [variable, stats] = await Promise.all([
		metadata.variable ? getVariable(id) : undefined,
		getStats(id),
	]);

	const res: FontMetadata = {
		metadata,
		variable,
		downloadCount: stats.total.npmDownloadTotal,
	};

	return json(res, {
		headers: {
			'Cache-Control': 'public, max-age=300',
		},
	});
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	const title = data?.metadata.family
		? `${data.metadata.family} | Fontsource`
		: undefined;

	const description = data?.metadata.family
		? `Download and self-host the ${data.metadata.family} font in a neatly bundled package.`
		: undefined;
	return ogMeta({ title, description });
};

export default function InstallPage() {
	const data = useLoaderData<FontMetadata>();
	const { metadata, variable, downloadCount } = data;

	return (
		<TabsWrapper metadata={metadata} tabsValue="install">
			<Install
				metadata={metadata}
				variable={variable}
				downloadCount={downloadCount}
			/>
		</TabsWrapper>
	);
}
