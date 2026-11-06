import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';

// Types
type CourseType = 'Starters' | 'Mains' | 'Desserts';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  course: CourseType;
  price: number;
}

// Initial Sample Data matching design
const INITIAL_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Citrus Cured Salmon',
    description: 'Fynbos honey infusion, pickled mustard seed, wild sea dill',
    course: 'Starters',
    price: 95,
  },
  {
    id: '2',
    name: 'Heirloom Tomato Tart',
    description: "Creamed goat's curd, wild basil reduction, buttery puff crust",
    course: 'Starters',
    price: 85,
  },
  {
    id: '3',
    name: 'Karoo Lamb Loin',
    description: 'Slow smoked aubergine, salt-baked beetroot, rich lamb reduction',
    course: 'Mains',
    price: 195,
  },
  {
    id: '4',
    name: 'Wild Mushroom Risotto',
    description: 'Truffle infusion, aged parmesan shards, fresh micro herbs',
    course: 'Mains',
    price: 180,
  },
  {
    id: '5',
    name: 'Madagascar Vanilla Soufflé',
    description: 'Served hot with a salted single-origin caramel pour-over',
    course: 'Desserts',
    price: 115,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'Home' | 'Add' | 'Manage'>('Home');
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_ITEMS);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterCourse, setSelectedFilterCourse] = useState<CourseType | 'All'>('All');

  // Form State (Add / Edit)
  const [dishName, setDishName] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState<CourseType>('Mains');
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Edit Modal State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Helper calculations for statistics
  const totalItemsCount = menuItems.length;
  const overallAveragePrice = totalItemsCount > 0 
    ? Math.round(menuItems.reduce((acc, curr) => acc + curr.price, 0) / totalItemsCount) 
    : 0;

  const getCourseCount = (courseType: CourseType) => {
    return menuItems.filter((item) => item.course === courseType).length;
  };

  const calculateAverage = (courseType: CourseType) => {
    const items = menuItems.filter((item) => item.course === courseType);
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, curr) => acc + curr.price, 0);
    return Math.round(sum / items.length);
  };

  // Add Item Handler with Validation
  const handleAddItem = () => {
    let newErrors: { [key: string]: string } = {};

    if (!dishName.trim()) newErrors.dishName = 'Dish name is required.';
    if (!description.trim()) newErrors.description = 'Description is required.';
    if (!price.trim()) {
      newErrors.price = 'Price is required.';
    } else if (isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Please enter a valid positive price number.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Validation Error', 'Please correct the highlighted fields before submitting.');
      return;
    }

    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: dishName.trim(),
      description: description.trim(),
      course: course,
      price: parseFloat(price),
    };

    setMenuItems([newItem, ...menuItems]);
    setDishName('');
    setDescription('');
    setPrice('');
    setCourse('Mains');
    setErrors({});

    Alert.alert('Success ✨', `"${newItem.name}" was successfully added to the menu!`, [
      { text: 'View Menu', onPress: () => setActiveTab('Home') },
      { text: 'Add Another', style: 'cancel' },
    ]);
  };

  // Open Edit Modal Handler
  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setDishName(item.name);
    setDescription(item.description);
    setCourse(item.course);
    setPrice(item.price.toString());
    setErrors({});
    setIsEditModalVisible(true);
  };

  // Update Item Handler
  const handleUpdateItem = () => {
    let newErrors: { [key: string]: string } = {};

    if (!dishName.trim()) newErrors.dishName = 'Dish name is required.';
    if (!description.trim()) newErrors.description = 'Description is required.';
    if (!price.trim()) {
      newErrors.price = 'Price is required.';
    } else if (isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Please enter a valid positive price number.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Validation Error', 'Please correct the highlighted fields.');
      return;
    }

    if (!editingItem) return;

    const updatedList = menuItems.map((item) =>
      item.id === editingItem.id
        ? {
            ...item,
            name: dishName.trim(),
            description: description.trim(),
            course: course,
            price: parseFloat(price),
          }
        : item
    );

    setMenuItems(updatedList);
    setIsEditModalVisible(false);
    setEditingItem(null);
    setDishName('');
    setDescription('');
    setPrice('');
    setCourse('Mains');
    setErrors({});

    Alert.alert('Updated Successfully ✨', 'Menu item information has been updated.');
  };

  // Delete Item Handler
  const handleDeleteItem = (id: string, name: string) => {
    Alert.alert('Remove Item', `Are you sure you want to remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setMenuItems(menuItems.filter((item) => item.id !== id));
        },
      },
    ]);
  };

  // Filter and Search logic for Home Screen Display
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = selectedFilterCourse === 'All' || item.course === selectedFilterCourse;
    return matchesSearch && matchesCourse;
  });

  // Render Screens
  const renderHome = () => {
    const starters = filteredMenuItems.filter((i) => i.course === 'Starters');
    const mains = filteredMenuItems.filter((i) => i.course === 'Mains');
    const desserts = filteredMenuItems.filter((i) => i.course === 'Desserts');

    return (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.brandTitle}>Christoffel</Text>
          <Text style={styles.brandSubtitle}>PRIVATE DINING MENU</Text>
        </View>

        {/* Comprehensive Statistics Section */}
        <View style={styles.totalBadgeCard}>
          <Text style={styles.totalBadgeLabel}>MENU OVERVIEW & STATISTICS</Text>
          <View style={styles.statsOverviewRow}>
            <View style={styles.overviewStatItem}>
              <Text style={styles.overviewStatVal}>{totalItemsCount}</Text>
              <Text style={styles.overviewStatTxt}>Total Dishes</Text>
            </View>
            <View style={styles.overviewStatDivider} />
            <View style={styles.overviewStatItem}>
              <Text style={styles.overviewStatVal}>R{overallAveragePrice}</Text>
              <Text style={styles.overviewStatTxt}>Overall Avg</Text>
            </View>
          </View>
        </View>

        {/* Course Item Counts & Price Averages */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>STARTERS ({getCourseCount('Starters')})</Text>
            <Text style={styles.statValue}>R{calculateAverage('Starters')}</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxHighlight]}>
            <Text style={[styles.statLabel, styles.textWhite]}>MAINS ({getCourseCount('Mains')})</Text>
            <Text style={[styles.statValue, styles.textWhite]}>R{calculateAverage('Mains')}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>DESSERTS ({getCourseCount('Desserts')})</Text>
            <Text style={styles.statValue}>R{calculateAverage('Desserts')}</Text>
          </View>
        </View>

        {/* Search Bar & Course Filter Section */}
        <View style={styles.searchFilterContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Search menu item by name..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipRow}>
            {(['All', 'Starters', 'Mains', 'Desserts'] as (CourseType | 'All')[]).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.filterChip,
                  selectedFilterCourse === cat && styles.filterChipActive,
                ]}
                onPress={() => setSelectedFilterCourse(cat)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilterCourse === cat && styles.filterChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {(searchQuery !== '' || selectedFilterCourse !== 'All') && (
            <TouchableOpacity
              style={styles.clearFilterBtn}
              onPress={() => {
                setSearchQuery('');
                setSelectedFilterCourse('All');
              }}
            >
              <Text style={styles.clearFilterText}>✕ Clear Search & Filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Empty State */}
        {filteredMenuItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Matching Dishes Found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search criteria or filter category.
            </Text>
          </View>
        ) : (
          <>
            {/* Starters Section */}
            {starters.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeader}>STARTERS</Text>
                {starters.map((item) => (
                  <View key={item.id} style={styles.dishCard}>
                    <View style={styles.dishHeader}>
                      <Text style={styles.dishTitle}>{item.name}</Text>
                      <Text style={styles.dishPrice}>R{item.price}</Text>
                    </View>
                    <Text style={styles.dishDescription}>{item.description}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Mains Section */}
            {mains.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeader}>MAINS</Text>
                {mains.map((item) => (
                  <View key={item.id} style={styles.dishCard}>
                    <View style={styles.dishHeader}>
                      <Text style={styles.dishTitle}>{item.name}</Text>
                      <Text style={styles.dishPrice}>R{item.price}</Text>
                    </View>
                    <Text style={styles.dishDescription}>{item.description}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Desserts Section */}
            {desserts.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionHeader}>DESSERTS</Text>
                {desserts.map((item) => (
                  <View key={item.id} style={styles.dishCard}>
                    <View style={styles.dishHeader}>
                      <Text style={styles.dishTitle}>{item.name}</Text>
                      <Text style={styles.dishPrice}>R{item.price}</Text>
                    </View>
                    <Text style={styles.dishDescription}>{item.description}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    );
  };

  const renderAddForm = () => {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>Add to Culinary Menu</Text>
          <Text style={styles.formSub}>
            Integrate a new hand-crafted recipe to the private tasting layout.
          </Text>
        </View>

        {/* Dish Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>DISH NAME *</Text>
          <TextInput
            style={[styles.input, errors.dishName ? styles.inputError : null]}
            placeholder="e.g. Sous-Vide Duck Breast"
            placeholderTextColor="#94A3B8"
            value={dishName}
            onChangeText={(t) => {
              setDishName(t);
              if (errors.dishName) setErrors({ ...errors, dishName: '' });
            }}
          />
          {errors.dishName ? <Text style={styles.errorText}>{errors.dishName}</Text> : null}
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>DESCRIPTION *</Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.description ? styles.inputError : null]}
            placeholder="Infused with whole spices, orange glaze crisp skin..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={(t) => {
              setDescription(t);
              if (errors.description) setErrors({ ...errors, description: '' });
            }}
          />
          {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
        </View>

        {/* Course Selection Buttons */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>COURSE</Text>
          <View style={styles.courseChipRow}>
            {(['Starters', 'Mains', 'Desserts'] as CourseType[]).map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.courseChip, course === c && styles.courseChipActive]}
                onPress={() => setCourse(c)}
              >
                <Text style={[styles.courseChipText, course === c && styles.courseChipTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>TASTING PRICE (ZAR R) *</Text>
          <TextInput
            style={[styles.input, errors.price ? styles.inputError : null]}
            placeholder="e.g. 195.00"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={price}
            onChangeText={(t) => {
              setPrice(t);
              if (errors.price) setErrors({ ...errors, price: '' });
            }}
          />
          {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.primaryBtn} onPress={handleAddItem}>
          <Text style={styles.primaryBtnText}>✓ Add to Menu</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderManageScreen = () => {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>Manage Creations</Text>
          <Text style={styles.formSub}>
            Edit or remove recipes prior to showcasing to active guests.
          </Text>
        </View>

        {menuItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Items to Manage</Text>
            <Text style={styles.emptySubtitle}>Your menu list is currently empty.</Text>
          </View>
        ) : (
          menuItems.map((item) => (
            <View key={item.id} style={styles.manageCard}>
              <View style={styles.manageInfo}>
                <Text style={styles.manageTitle}>{item.name}</Text>
                <View style={styles.manageMeta}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.course.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.managePrice}>R{item.price}</Text>
                </View>
              </View>

              <View style={styles.manageActionRow}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => handleOpenEdit(item)}
                >
                  <Text style={styles.editBtnText}>✏️ Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteItem(item.id, item.name)}
                >
                  <Text style={styles.deleteBtnText}>✕ Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content"/>

      {/* Main Content Area */}
      <View style={styles.container}>
        {activeTab === 'Home' && renderHome()}
        {activeTab === 'Add' && renderAddForm()}
        {activeTab === 'Manage' && renderManageScreen()}
      </View>

      {/* Edit Item Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.formTitle}>Edit Menu Item</Text>
              <Text style={styles.formSub}>Update information for this dish.</Text>

              {/* Dish Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>DISH NAME *</Text>
                <TextInput
                  style={[styles.input, errors.dishName ? styles.inputError : null]}
                  value={dishName}
                  onChangeText={(t) => {
                    setDishName(t);
                    if (errors.dishName) setErrors({ ...errors, dishName: '' });
                  }}
                />
                {errors.dishName ? <Text style={styles.errorText}>{errors.dishName}</Text> : null}
              </View>

              {/* Description */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>DESCRIPTION *</Text>
                <TextInput
                  style={[styles.input, styles.textArea, errors.description ? styles.inputError : null]}
                  multiline
                  numberOfLines={3}
                  value={description}
                  onChangeText={(t) => {
                    setDescription(t);
                    if (errors.description) setErrors({ ...errors, description: '' });
                  }}
                />
                {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
              </View>

              {/* Course Selection */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>COURSE</Text>
                <View style={styles.courseChipRow}>
                  {(['Starters', 'Mains', 'Desserts'] as CourseType[]).map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.courseChip, course === c && styles.courseChipActive]}
                      onPress={() => setCourse(c)}
                    >
                      <Text style={[styles.courseChipText, course === c && styles.courseChipTextActive]}>
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Price */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>TASTING PRICE (ZAR R) *</Text>
                <TextInput
                  style={[styles.input, errors.price ? styles.inputError : null]}
                  keyboardType="numeric"
                  value={price}
                  onChangeText={(t) => {
                    setPrice(t);
                    if (errors.price) setErrors({ ...errors, price: '' });
                  }}
                />
                {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
              </View>

              {/* Modal Action Buttons */}
              <TouchableOpacity style={styles.primaryBtn} onPress={handleUpdateItem}>
                <Text style={styles.primaryBtnText}>✓ Save Changes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bottom Floating Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Home')}>
          <Text style={[styles.navIcon, activeTab === 'Home' && styles.navIconActive]}>📖</Text>
          <Text style={[styles.navLabel, activeTab === 'Home' && styles.navLabelActive]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Add')}>
          <View style={styles.addNavCircle}>
            <Text style={styles.addNavCircleText}>+</Text>
          </View>
          <Text style={[styles.navLabel, activeTab === 'Add' && styles.navLabelActive]}>
            Add Item
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Manage')}>
          <Text style={[styles.navIcon, activeTab === 'Manage' && styles.navIconActive]}>⚙️</Text>
          <Text style={[styles.navLabel, activeTab === 'Manage' && styles.navLabelActive]}>
            Manage
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Styling (Vibrant Indigo & Warm Amber Palette)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },

  // Header & Brand
  headerContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E1B4B',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366F1',
    letterSpacing: 2,
    marginTop: 4,
  },

  // Badges & Stats Cards
  totalBadgeCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    padding: 16,
    marginVertical: 14,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  totalBadgeLabel: {
    color: '#C7D2FE',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  statsOverviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  overviewStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  overviewStatVal: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  overviewStatTxt: {
    color: '#E0E7FF',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  overviewStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statBoxHighlight: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  textWhite: {
    color: '#FFFFFF',
  },

  // Search & Filter Styling
  searchFilterContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 10,
  },
  filterChipRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: '#1E1B4B',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  clearFilterBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },

  // Section Headers & Dish Cards
  sectionContainer: {
    marginTop: 10,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  dishCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  dishHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dishTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  dishPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: '#4F46E5',
    marginLeft: 8,
  },
  dishDescription: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
    lineHeight: 18,
  },

  // Form Screen Styling
  formHeader: {
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  formSub: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },

  // Chips
  courseChipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  courseChip: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  courseChipActive: {
    backgroundColor: '#4F46E5',
  },
  courseChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  courseChipTextActive: {
    color: '#FFFFFF',
  },

  // Buttons
  primaryBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  // Manage Screen Styles
  manageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  manageInfo: {
    flex: 1,
    marginRight: 10,
  },
  manageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  manageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  badgeText: {
    color: '#4F46E5',
    fontSize: 10,
    fontWeight: '800',
  },
  managePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  manageActionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  editBtn: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editBtnText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalCancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  modalCancelText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '700',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },

  // Bottom Navigation
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navIcon: {
    fontSize: 18,
    opacity: 0.6,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#F59E0B',
    fontWeight: '800',
  },
  addNavCircle: {
    backgroundColor: '#4F46E5',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNavCircleText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: -2,
  },
});