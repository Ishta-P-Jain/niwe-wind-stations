import wmsReference from "../../assets/LIST_OF_WMS_AS_ON_31072026.pdf";

function Footer() {
  return (
    <div style={{ display: "grid", gap: "0.35rem" }}>
      <strong style={{ color: "#FFFFFF" }}>Reference Resources</strong>
      <a
        href={wmsReference}
        target="_blank"
        rel="noreferrer"
        style={{ color: "#E2E8F0" }}
      >
        LIST_OF_WMS_AS_ON_31072026
      </a>
      <p style={{ margin: 0 }}>
        NIWE Wind Resource Maps:{" "}
        <a
          href="https://maps.niwe.res.in/resource_map/map/150m/"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#E2E8F0" }}
        >
          150 m
        </a>
        {" | "}
        <a
          href="https://maps.niwe.res.in/resource_map/map/120m/"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#E2E8F0" }}
        >
          120 m
        </a>
      </p>
    </div>
  );
}

export default Footer;