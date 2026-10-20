import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
  Image,
} from "react-native";
import { API_URL } from "../config";

const showAlert = (title, message) => {
  if (Platform.OS === "web") {
    window.alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
};

// ============================================================
// High-res Portraits from MemberCard Demo (Data URIs)
// ============================================================
const PORTRAITS = [
  "data:image/webp;base64,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",
  "data:image/webp;base64,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",
  "data:image/webp;base64,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",
  "data:image/webp;base64,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",
  "data:image/webp;base64,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"
];

export default function DashboardScreen({ navigation }) {
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [salary, setSalary] = useState("");
  const [clusters, setClusters] = useState(null);
  const [loadingClusters, setLoadingClusters] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // 'ALL' | 'Active' | 'On Leave'
  const [sortBy, setSortBy] = useState("DEFAULT");
  const [showAddForm, setShowAddForm] = useState(false);

  // ============================================================
  // Fetch all employees
  // ============================================================
  const fetchEmployees = useCallback(async () => {
    setLoadingList(true);
    try {
      const response = await fetch(`${API_URL}/api/employees`);
      const data = await response.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      showAlert("Error", "Could not fetch employees from backend");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // ============================================================
  // Add Employee (with client-side validation)
  // ============================================================
  const addEmployee = async () => {
    if (!name.trim()) {
      showAlert("Validation Error", "Name is required");
      return;
    }
    if (!position.trim()) {
      showAlert("Validation Error", "Position is required");
      return;
    }
    if (!salary.trim()) {
      showAlert("Validation Error", "Salary is required");
      return;
    }
    if (isNaN(Number(salary)) || Number(salary) <= 0) {
      showAlert("Validation Error", "Salary must be a valid positive number");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          position: position.trim(),
          salary: Number(salary),
        }),
      });

      if (response.status === 400) {
        const data = await response.json();
        showAlert("Error", data.message);
        return;
      }

      setName("");
      setPosition("");
      setSalary("");
      setShowAddForm(false);
      fetchEmployees();
    } catch (error) {
      showAlert("Error", "Could not add employee");
    }
  };

  // ============================================================
  // Toggle Status (Active <-> On Leave)
  // ============================================================
  const toggleStatus = async (id) => {
    try {
      await fetch(`${API_URL}/api/employees/${id}/status`, {
        method: "PUT",
      });
      fetchEmployees();
    } catch (error) {
      showAlert("Error", "Could not update status");
    }
  };

  // ============================================================
  // Delete Employee (with confirmation dialog)
  // ============================================================
  const performDelete = async (id) => {
    try {
      await fetch(`${API_URL}/api/employees/${id}`, {
        method: "DELETE",
      });
      fetchEmployees();
    } catch (error) {
      showAlert("Error", "Could not delete employee");
    }
  };

  const deleteEmployee = (id, employeeName) => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(`Are you sure you want to delete ${employeeName}?`);
      if (confirmed) {
        performDelete(id);
      }
    } else {
      Alert.alert(
        "Confirm Delete",
        `Are you sure you want to delete ${employeeName}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => performDelete(id),
          },
        ]
      );
    }
  };

  // ============================================================
  // Phase 2: Analyze Salary Structure (K-Means)
  // ============================================================
  const analyzeSalary = async () => {
    setLoadingClusters(true);
    setClusters(null);
    try {
      const response = await fetch(`${API_URL}/api/employees/salary-clusters`);
      const data = await response.json();
      if (data.success) {
        setClusters(data.clusters);
      }
    } catch (error) {
      showAlert("Error", "Could not analyze salary data");
    } finally {
      setLoadingClusters(false);
    }
  };

  // ============================================================
  // Summary Metrics
  // ============================================================
  const metrics = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.status === "Active").length;
    const onLeave = employees.filter((e) => e.status === "On Leave").length;
    const totalPayroll = employees.reduce((sum, e) => sum + Number(e.salary || 0), 0);
    const avgSalary = total > 0 ? Math.round(totalPayroll / total) : 0;
    return { total, active, onLeave, totalPayroll, avgSalary };
  }, [employees]);

  // Filter & Sort
  const filteredEmployees = useMemo(() => {
    let list = [...employees];
    if (statusFilter !== "ALL") {
      list = list.filter((e) => e.status === statusFilter);
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (e) =>
          (e.name && e.name.toLowerCase().includes(q)) ||
          (e.position && e.position.toLowerCase().includes(q))
      );
    }
    if (sortBy === "SALARY_DESC") {
      list.sort((a, b) => Number(b.salary) - Number(a.salary));
    } else if (sortBy === "SALARY_ASC") {
      list.sort((a, b) => Number(a.salary) - Number(b.salary));
    } else if (sortBy === "NAME") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [employees, statusFilter, searchQuery, sortBy]);

  // ============================================================
  // MemberCard Component Render
  // ============================================================
  const renderMemberCard = (item, index) => {
    const isActive = item.status === "Active";
    const isPremium = Number(item.salary) >= 75000;
    const portraitUri = PORTRAITS[index % PORTRAITS.length];

    return (
      <View key={item.id} style={styles.memberCard}>
        {/* Hairline subtle top indicator for on leave */}
        {!isActive && <View style={styles.pendingBar} />}

        {/* Real Portrait Avatar from 21st.dev Component */}
        <Image
          source={{ uri: portraitUri }}
          style={[styles.memberAvatar, !isActive && { opacity: 0.6 }]}
        />

        {/* Content Info */}
        <View style={styles.memberInfo}>
          {/* First line: Name, Crown, Status Pill, Premium */}
          <View style={styles.memberNameRow}>
            <Text style={[styles.memberName, !isActive && styles.memberNameMuted]}>
              {item.name}
            </Text>

            {/* Premium Gold Sparkle Badge */}
            {isPremium && (
              <View style={styles.premiumChip}>
                <Text style={styles.premiumText}>✨ Premium</Text>
              </View>
            )}

            {/* Status Pill */}
            <View style={[styles.statusPill, isActive ? styles.pillActive : styles.pillLeave]}>
              <View style={[styles.statusDot, isActive ? styles.dotActive : styles.dotLeave]} />
              <Text style={[styles.statusPillText, isActive ? styles.textActive : styles.textLeave]}>
                {item.status}
              </Text>
            </View>
          </View>

          {/* Subtitle: Role Chip, separator, Salary */}
          <View style={styles.memberMetaRow}>
            <Text style={styles.roleLabel}>{item.position}</Text>
            <Text style={styles.metaDivider}>·</Text>
            <Text style={styles.salaryLabel}>
              ฿{Number(item.salary).toLocaleString()}
            </Text>
            <Text style={styles.salaryPeriod}>/mo</Text>
          </View>
        </View>

        {/* Interactive Action Buttons */}
        <View style={styles.memberActionGroup}>
          <TouchableOpacity
            style={[styles.actionBtn, isActive ? styles.actionBtnLeave : styles.actionBtnActive]}
            onPress={() => toggleStatus(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionBtnText}>
              {isActive ? "Set Leave" : "Set Active"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteActionBtn}
            onPress={() => deleteEmployee(item.id, item.name)}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteActionText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <View style={styles.container}>
        {/* ============================================================ */}
        {/* Top Navbar */}
        {/* ============================================================ */}
        <View style={styles.header}>
          <View>
            <View style={styles.brandRow}>
              <Text style={styles.brandIcon}>🏢</Text>
              <Text style={styles.brandTitle}>Northwind HR System</Text>
            </View>
            <Text style={styles.brandSubtitle}>
              Workforce Roster & Salary Analytics • StudentID: 6730251174
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addTriggerBtn}
            onPress={() => setShowAddForm(!showAddForm)}
            activeOpacity={0.8}
          >
            <Text style={styles.addTriggerBtnText}>
              {showAddForm ? "Close Form" : "＋ Add Employee"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ============================================================ */}
        {/* Summary Metric Ribbon */}
        {/* ============================================================ */}
        <View style={styles.metricRibbon}>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>{metrics.total}</Text>
            <Text style={styles.metricLbl}>Total Members</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricVal, { color: "#059669" }]}>{metrics.active}</Text>
            <Text style={styles.metricLbl}>Active</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricVal, { color: "#D97706" }]}>{metrics.onLeave}</Text>
            <Text style={styles.metricLbl}>On Leave</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricVal, { color: "#4F46E5" }]}>
              ฿{metrics.avgSalary.toLocaleString()}
            </Text>
            <Text style={styles.metricLbl}>Avg Salary</Text>
          </View>
        </View>

        {/* ============================================================ */}
        {/* Add Employee Form (Collapsible) */}
        {/* ============================================================ */}
        {showAddForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>➕ Add New Member</Text>
            <View style={styles.formRow}>
              <TextInput
                style={styles.formInput}
                placeholder="Full Name (e.g. Sarah Anderson)"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.formInput}
                placeholder="Position / Title (e.g. Lead Designer)"
                placeholderTextColor="#9CA3AF"
                value={position}
                onChangeText={setPosition}
              />
              <TextInput
                style={styles.formInput}
                placeholder="Base Salary (฿)"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={salary}
                onChangeText={setSalary}
              />
            </View>
            <TouchableOpacity style={styles.submitBtn} onPress={addEmployee} activeOpacity={0.85}>
              <Text style={styles.submitBtnText}>Confirm Add Member</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ============================================================ */}
        {/* K-Means Analytics Section */}
        {/* ============================================================ */}
        <View style={styles.analyticsSection}>
          <View style={styles.analyticsHeader}>
            <View>
              <Text style={styles.analyticsTitle}>📊 Salary Structure Analytics (K-Means)</Text>
              <Text style={styles.analyticsSubtitle}>
                Algorithm automatically partitions salaries into 3 distinct compensation tiers (k=3)
              </Text>
            </View>
            <TouchableOpacity
              style={styles.analyzeBtn}
              onPress={analyzeSalary}
              activeOpacity={0.85}
              disabled={loadingClusters}
            >
              {loadingClusters ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.analyzeBtnText}>Run K-Means Analysis</Text>
              )}
            </TouchableOpacity>
          </View>

          {clusters && (
            <View style={styles.clustersRow}>
              {clusters.map((cluster, i) => {
                const borderColors = ["#10B981", "#F59E0B", "#EF4444"];
                const bgColors = ["#ECFDF5", "#FFFBEB", "#FEF2F2"];
                const textColors = ["#047857", "#B45309", "#B91C1C"];
                return (
                  <View
                    key={i}
                    style={[
                      styles.clusterCard,
                      {
                        borderTopColor: borderColors[i % 3],
                        backgroundColor: bgColors[i % 3],
                      },
                    ]}
                  >
                    <Text style={[styles.clusterGroup, { color: textColors[i % 3] }]}>
                      {cluster.group}
                    </Text>
                    <Text style={styles.clusterCentroid}>
                      ฿{Number(cluster.centroid).toLocaleString()}
                    </Text>
                    <Text style={styles.clusterSub}>Average Base Salary</Text>
                    <View style={styles.clusterCountBadge}>
                      <Text style={styles.clusterCountText}>{cluster.count} employees</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* ============================================================ */}
        {/* Member Roster (21st.dev MemberCard Style) */}
        {/* ============================================================ */}
        <View style={styles.rosterSection}>
          <View style={styles.rosterHeader}>
            <Text style={styles.rosterEyebrow}>
              NORTHWIND WORKFORCE ROSTER · {filteredEmployees.length} PEOPLE
            </Text>

            {/* Filter buttons */}
            <View style={styles.filterGroup}>
              {["ALL", "Active", "On Leave"].map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[styles.filterChip, statusFilter === st && styles.filterChipActive]}
                  onPress={() => setStatusFilter(st)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      statusFilter === st && styles.filterChipTextActive,
                    ]}
                  >
                    {st}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Search bar */}
          <TextInput
            style={styles.searchBar}
            placeholder="🔍 Search member by name or position..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {loadingList && (
            <ActivityIndicator size="large" color="#4F46E5" style={{ marginVertical: 30 }} />
          )}

          {/* Member Card List */}
          <View style={styles.memberList}>
            {filteredEmployees.map((emp, index) => renderMemberCard(emp, index))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================================
// Styles (Matching exact 21st.dev MemberCard & Tailwind aesthetic)
// ============================================================
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  screenContent: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  container: {
    width: "100%",
    maxWidth: 720,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandIcon: {
    fontSize: 22,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12.5,
    color: "#6B7280",
    marginTop: 2,
  },
  addTriggerBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  addTriggerBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  // Metrics
  metricRibbon: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricVal: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  metricLbl: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
    textTransform: "uppercase",
    fontWeight: "500",
  },

  // Add Form
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  formTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  formRow: {
    gap: 10,
    marginBottom: 12,
  },
  formInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    color: "#111827",
  },
  submitBtn: {
    backgroundColor: "#059669",
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: "center",
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "600",
  },

  // Analytics K-Means
  analyticsSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  analyticsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  analyticsTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  analyticsSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  analyzeBtn: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  analyzeBtnText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "600",
  },
  clustersRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  clusterCard: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  clusterGroup: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  clusterCentroid: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginTop: 4,
  },
  clusterSub: {
    fontSize: 10.5,
    color: "#6B7280",
  },
  clusterCountBadge: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  clusterCountText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
  },

  // Roster
  rosterSection: {
    width: "100%",
  },
  rosterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  rosterEyebrow: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    color: "#9CA3AF",
  },
  filterGroup: {
    flexDirection: "row",
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
  },
  filterChipActive: {
    backgroundColor: "#111827",
  },
  filterChipText: {
    fontSize: 11.5,
    color: "#4B5563",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  searchBar: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: "#111827",
    marginBottom: 14,
  },
  memberList: {
    gap: 8,
  },

  // ============================================================
  // MemberCard Styles (Faithful implementation of 21st.dev)
  // ============================================================
  memberCard: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    overflow: "hidden",
  },
  pendingBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#F59E0B",
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
  },
  memberInfo: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  memberNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  memberName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    letterSpacing: -0.2,
  },
  memberNameMuted: {
    color: "#6B7280",
  },
  premiumChip: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(217, 119, 6, 0.2)",
  },
  premiumText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#B45309",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 999,
  },
  pillActive: {
    backgroundColor: "#ECFDF5",
  },
  pillLeave: {
    backgroundColor: "#FFFBEB",
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotActive: {
    backgroundColor: "#10B981",
  },
  dotLeave: {
    backgroundColor: "#F59E0B",
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "500",
  },
  textActive: {
    color: "#059669",
  },
  textLeave: {
    color: "#D97706",
  },
  memberMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  roleLabel: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
  },
  metaDivider: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  salaryLabel: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "600",
  },
  salaryPeriod: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  memberActionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionBtnActive: {
    backgroundColor: "#EEF2FF",
  },
  actionBtnLeave: {
    backgroundColor: "#F3F4F6",
  },
  actionBtnText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#4338CA",
  },
  deleteActionBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteActionText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "700",
  },
});
