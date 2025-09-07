import React, {useMemo} from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import versions from "@site/src/generated/integrationVersions.json";

export default function IntegrationVersionPicker() {
  const latest = versions.latest;
  const tags: string[] = versions.tags || [];

  const target = useMemo(() => useBaseUrl(`/docs/dev/integrationrepo/v/${latest}/`), [latest]);

  const onChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const t = e.target.value;
    const url = useBaseUrl(`/docs/dev/integrationrepo/v/${t}/`);
    window.location.href = url;
  };

  return (
    <div style={{margin: "1rem 0"}}>
      <div style={{display:"flex", alignItems:"center", gap:"0.75rem", flexWrap:"wrap"}}>
        <strong>Version:</strong>
        <select onChange={onChange} defaultValue={latest}>
          {tags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <a className="button button--sm button--primary" href={target}>
          Open {latest}
        </a>
      </div>
      <p style={{opacity:0.75, marginTop:"0.5rem"}}>
        These docs are built from repository READMEs pinned to each tag and its submodule commits.
      </p>
    </div>
  );
}
