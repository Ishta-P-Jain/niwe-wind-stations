// @ts-expect-error WindMap is a JavaScript module without a declaration file.
import WindMap from "../map/WindMap";
import { useMemo, useRef, useState } from "react";
import { useStations } from "../../context/StationsContext";
import type { StationFeatureCollection } from "../../types/station";
import InstallationTimeline from "./InstallationTimeline";
import KPICards from "./KPICards";
import MastHeightChart from "./MastHeightChart";
import PowerDensityChart from "./PowerDensityChart";
import StateStatistics from "./StateStatistics";
import StatusChart from "./StatusChart";
import StationDetails from "./StationDetails";
import StationTable from "./StationTable";
import WindSpeedChart from "./WindSpeedChart";
import Footer from "./Footer";
import gawcLogo from "../../assets/gawc-logo.png.jpeg";
import makeInIndiaLogo from "../../assets/make-in-india.png.jpeg";



const ALL_STATES = "All States";

function Dashboard() {
  const { stations, loading, error } = useStations();
  const [selectedState, setSelectedState] = useState(ALL_STATES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStationId, setSelectedStationId] = useState<string | null>(
    null,
  );
  const [mapFitTrigger, setMapFitTrigger] = useState(0);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const availableStates = useMemo(
    () =>
      stations
        ? Array.from(
            new Set(
              stations.features
                .map((station) => station.properties.state)
                .filter(
                  (state) =>
                    typeof state === "string" && state.trim().length > 0,
                ),
            ),
          ).sort((a, b) => a.localeCompare(b))
        : [],
    [stations],
  );
  const filteredStations = useMemo<StationFeatureCollection | null>(() => {
    if (!stations) return null;

    const stateFilteredFeatures =
      selectedState === ALL_STATES
        ? stations.features
        : stations.features.filter(
            (station) => station.properties.state === selectedState,
          );
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const features = normalizedQuery
      ? stateFilteredFeatures.filter((station) =>
          [
            station.properties.station_name,
            station.properties.district,
            station.properties.state,
          ].some(
            (value) =>
              typeof value === "string" &&
              value.toLowerCase().includes(normalizedQuery),
          ),
        )
      : stateFilteredFeatures;

    if (selectedState === ALL_STATES && normalizedQuery.length === 0) {
      return stations;
    }

    return { ...stations, features };
  }, [stations, selectedState, searchQuery]);

  if (loading) {
    return (
      <main aria-busy="true" aria-live="polite">
        <p>Loading station analytics...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <p role="alert">Failed to load station data: {error.message}</p>
      </main>
    );
  }

  if (!stations || !filteredStations) {
    return (
      <main>
        <p role="alert">Station data is unavailable.</p>
      </main>
    );
  }

  const selectedStation =
    filteredStations.features.find(
      (station) => station.properties.id === selectedStationId,
    ) ?? null;
  const resetDisabled =
    selectedState === ALL_STATES &&
    searchQuery.trim().length === 0 &&
    selectedStationId === null;

  return (
    <>
    <main
      style={{
        display: "flex",
        flex: "1 0 auto",
        flexDirection: "column",
        gap: "1.5rem",
        padding: "clamp(1rem, 3vw, 2rem)",
        width: "100%",
        maxWidth: "1126px",
        marginInline: "auto",
        boxSizing: "border-box",
      }}
    >
      <style>
        {`
          .dashboard-layout-row {
            display: grid;
            gap: 1.5rem;
            min-width: 0;
            width: 100%;
          }

          .dashboard-map-status-row {
            grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
            align-items: stretch;
          }

          .dashboard-chart-row {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            align-items: stretch;
          }

          .dashboard-map-container {
            min-width: 0;
            position: relative;
            width: 100%;
            overflow: hidden;
            border: 1px solid var(--border);
            border-radius: 10px;
            scroll-margin-top: 1rem;
          }

          .dashboard-map-container:hover .map-zoom-hint {
            opacity: 0;
          }

          @media (max-width: 900px) {
            .dashboard-map-status-row,
            .dashboard-chart-row {
              grid-template-columns: minmax(0, 1fr);
            }
          }
        `}
      </style>
      <header
        style={{
          alignItems: "end",
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          justifyContent: "space-between",
          textAlign: "left",
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            flex: "1 1 auto",
            gap: "1rem",
            justifyContent: "space-between",
            minWidth: 0,
          }}
        >
          <div>
            <h1
              style={{
                color: "#FFFFFF",
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                letterSpacing: "-0.04em",
                margin: 0,
                textShadow: "0 2px 8px rgba(0, 0, 0, 0.85)",
              }}
            >
              NIWE Wind Measurement Station Portal
            </h1>
            <p
              style={{
                color: "#F1F5F9",
                marginTop: "0.5rem",
                textShadow: "0 1px 5px rgba(0, 0, 0, 0.9)",
              }}
            >
              Interactive Wind Resource Monitoring &amp; Analytics Platform
            </p>
          </div>
          <img
            src={gawcLogo}
            alt="GAWC Renewables LLP company logo"
            style={{
              flex: "0 0 auto",
              height: "clamp(4rem, 8vw, 7rem)",
              objectFit: "contain",
              filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35))",
              width: "clamp(4rem, 8vw, 7rem)",
            }}
          />
        </div>
        <div
          style={{
            display: "grid",
            flex: "1 1 32rem",
            gap: "0.75rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 14rem), 1fr))",
            maxWidth: "56rem",
          }}
        >
          <label
            style={{
              color: "var(--text)",
              display: "grid",
              fontSize: "0.9rem",
              gap: "0.35rem",
            }}
          >
            <span>State</span>
            <select
              id="dashboard-state-filter"
              value={selectedState}
              onChange={(event) => {
                setSelectedState(event.target.value);
                setSelectedStationId(null);
              }}
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--text-h)",
                font: "inherit",
                minHeight: "2.75rem",
                padding: "0.55rem 0.75rem",
                width: "100%",
              }}
            >
              <option value={ALL_STATES}>{ALL_STATES}</option>
              {availableStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
          <label
            htmlFor="dashboard-station-search"
            style={{
              color: "var(--text)",
              display: "grid",
              fontSize: "0.9rem",
              gap: "0.35rem",
            }}
          >
            <span>Search</span>
            <span style={{ position: "relative" }}>
              <input
                id="dashboard-station-search"
                type="text"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setSelectedStationId(null);
                }}
                placeholder="Search station or district..."
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  color: "var(--text-h)",
                  font: "inherit",
                  minHeight: "2.75rem",
                  padding: "0.55rem 2.5rem 0.55rem 0.75rem",
                  width: "100%",
                }}
              />
              {searchQuery.length > 0 && (
                <button
                  type="button"
                  aria-label="Clear station search"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedStationId(null);
                  }}
                  style={{
                    alignItems: "center",
                    background: "transparent",
                    border: 0,
                    color: "var(--text)",
                    cursor: "pointer",
                    display: "flex",
                    font: "inherit",
                    fontSize: "1.25rem",
                    height: "100%",
                    justifyContent: "center",
                    padding: 0,
                    position: "absolute",
                    right: "0.5rem",
                    top: 0,
                    width: "1.5rem",
                  }}
                >
                  ×
                </button>
              )}
            </span>
          </label>
          <button
            type="button"
            disabled={resetDisabled}
            onClick={() => {
              setSelectedState(ALL_STATES);
              setSearchQuery("");
              setSelectedStationId(null);
              setMapFitTrigger((trigger) => trigger + 1);
            }}
            style={{
              alignSelf: "end",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text-h)",
              cursor: resetDisabled ? "not-allowed" : "pointer",
              font: "inherit",
              minHeight: "2.75rem",
              opacity: resetDisabled ? 0.55 : 1,
              padding: "0.55rem 0.75rem",
            }}
          >
            Reset Filters
          </button>
        </div>
      </header>
      <KPICards stations={filteredStations} />
      <div className="dashboard-layout-row dashboard-map-status-row">
        <div ref={mapContainerRef} className="dashboard-map-container">
          <WindMap
            stations={filteredStations}
            selectedStationId={selectedStationId}
            onStationSelect={setSelectedStationId}
            fitTrigger={mapFitTrigger}
            disableClustering={
              selectedState !== ALL_STATES ||
              filteredStations.features.length < stations.features.length
            }
          />
          <p
            role="note"
            className="map-zoom-hint"
            style={{
              background: "rgba(15, 23, 42, 0.85)",
              borderRadius: "4px",
              bottom: "0.75rem",
              color: "#FFFFFF",
              fontSize: "0.75rem",
              left: "50%",
              padding: "0.25rem 0.5rem",
              pointerEvents: "none",
              position: "absolute",
              transform: "translateX(-50%)",
              transition: "opacity 200ms ease",
              whiteSpace: "nowrap",
              zIndex: 1000,
            }}
          >
            Hold Ctrl and scroll while hovering over the map to zoom.
          </p>
        </div>
        <StatusChart stations={filteredStations} />
      </div>
      <StateStatistics stations={filteredStations} />
      <div className="dashboard-layout-row dashboard-chart-row">
        <MastHeightChart stations={filteredStations} />
        <WindSpeedChart stations={filteredStations} />
      </div>
      <div className="dashboard-layout-row dashboard-chart-row">
        <PowerDensityChart stations={filteredStations} />
        <InstallationTimeline stations={filteredStations} />
      </div>
      <StationTable
        key={`${selectedState}|${searchQuery}`}
        stations={filteredStations}
        selectedStationId={selectedStationId}
        onStationSelect={(stationId) => {
          setSelectedStationId(stationId);
          mapContainerRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }}
      />
      <StationDetails
        station={selectedStation}
        onClose={() => setSelectedStationId(null)}
      />
    </main>
      <footer
        style={{
          padding: "1.5rem clamp(1rem, 3vw, 2rem)",
          background: "#0f172a",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          color: "#BDBDBD",
          fontSize: "0.9rem",
          textAlign: "left",
          width: "100%",
        }}
      >
        <div>
          <div style={{ color: "#FFFFFF", fontWeight: 600 }}>
            NIWE Wind Measurement Station Portal
          </div>
          <div style={{ color: "#E2E8F0" }}>
            Contributed by Shreya, Ishta, Manya, Moulya and Manish
            <br />
            NMAM Institute of Technology, Nitte
          </div>
        </div>

        <Footer />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <span style={{ color: "#FFFFFF", fontWeight: 600 }}>
            MAKE IN INDIA
          </span>

          <img
            src={makeInIndiaLogo}
            alt="Make in India"
            style={{
              height: "45px",
              width: "auto",
              objectFit: "contain",
            }}
          />
        </div>
      </footer>
    </>
  );
}

export default Dashboard;
