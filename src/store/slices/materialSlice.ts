import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AxiosInstance from '../AxiosInstance';
import { matchesSearchTerm } from '../../utils/vietnameseUtils';

// Material interface based on the backend model
export interface Material {
  _id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  unit: string;
  supplier: string;
  description?: string;
  minStock?: number;
  maxStock?: number;
  location?: string;
  userId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MaterialState {
  materials: Material[];
  isLoading: boolean;
  error: string | null;
  selectedMaterial: Material | null;
  filters: {
    category: string;
    supplier: string;
    searchTerm: string;
    lowStockOnly: boolean;
  };
  lowStockMaterials: Material[];
  lowStockThreshold: number;
}

const initialState: MaterialState = {
  materials: [],
  isLoading: false,
  error: null,
  selectedMaterial: null,
  filters: {
    category: '',
    supplier: '',
    searchTerm: '',
    lowStockOnly: false,
  },
  lowStockMaterials: [],
  lowStockThreshold: 10,
};

// Async thunks for API calls
export const fetchMaterials = createAsyncThunk(
  'materials/fetchMaterials',
  async (_, { rejectWithValue }) => {
    try {
      const axiosInstance = AxiosInstance();
      const response = await axiosInstance.get('/materials');
      console.log('Fetch materials response:', response);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch materials');
    }
  }
);

export const fetchMaterialById = createAsyncThunk(
  'materials/fetchMaterialById',
  async (id: string, { rejectWithValue }) => {
    try {
      const axiosInstance = AxiosInstance();
      const response = await axiosInstance.get(`/materials/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch material');
    }
  }
);

export const createMaterial = createAsyncThunk(
  'materials/createMaterial',
  async (materialData: Partial<Material>, { rejectWithValue }) => {
    try {
      const axiosInstance = AxiosInstance();
      const response = await axiosInstance.post('/materials', materialData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create material');
    }
  }
);

export const updateMaterial = createAsyncThunk(
  'materials/updateMaterial',
  async ({ id, materialData }: { id: string; materialData: Partial<Material> }, { rejectWithValue }) => {
    try {
      const axiosInstance = AxiosInstance();
      const response = await axiosInstance.patch(`/materials/${id}`, materialData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update material');
    }
  }
);

export const deleteMaterial = createAsyncThunk(
  'materials/deleteMaterial',
  async (id: string, { rejectWithValue }) => {
    try {
      const axiosInstance = AxiosInstance();
      const response = await axiosInstance.delete(`/materials/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete material');
    }
  }
);

export const fetchMaterialsByCategory = createAsyncThunk(
  'materials/fetchMaterialsByCategory',
  async (category: string, { rejectWithValue }) => {
    try {
      const axiosInstance = AxiosInstance();
      const response = await axiosInstance.get(`/materials/category/${category}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch materials by category');
    }
  }
);

export const fetchLowStockMaterials = createAsyncThunk(
  'materials/fetchLowStockMaterials',
  async (threshold: number = 10, { rejectWithValue }) => {
    try {
      const axiosInstance = AxiosInstance();
      const response = await axiosInstance.get(`/materials/low-stock?threshold=${threshold}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch low stock materials');
    }
  }
);

const materialSlice = createSlice({
  name: 'materials',
  initialState,
  reducers: {
    setSelectedMaterial: (state, action: PayloadAction<Material | null>) => {
      state.selectedMaterial = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<MaterialState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        supplier: '',
        searchTerm: '',
        lowStockOnly: false,
      };
    },
    setLowStockThreshold: (state, action: PayloadAction<number>) => {
      state.lowStockThreshold = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Local filtering for search functionality
    filterMaterials: (state) => {
      // This will be handled by selectors in components
      // The actual filtering logic can be implemented in selectors
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Materials
      .addCase(fetchMaterials.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.isLoading = false;
        state.materials = action.payload as unknown as Material[];
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Material by ID
      .addCase(fetchMaterialById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMaterialById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedMaterial = action.payload as unknown as Material;
      })
      .addCase(fetchMaterialById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create Material
      .addCase(createMaterial.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMaterial.fulfilled, (state, action) => {
        state.isLoading = false;
        state.materials.push(action.payload as unknown as Material);
      })
      .addCase(createMaterial.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update Material
      .addCase(updateMaterial.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMaterial.fulfilled, (state, action) => {
        state.isLoading = false;
        const material = action.payload as unknown as Material;
        const index = state.materials.findIndex(m => m._id === material._id);
        if (index !== -1) {
          state.materials[index] = material;
        }
        if (state.selectedMaterial?._id === material._id) {
          state.selectedMaterial = material;
        }
      })
      .addCase(updateMaterial.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete Material
      .addCase(deleteMaterial.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMaterial.fulfilled, (state, action) => {
        state.isLoading = false;
        const material = action.payload as unknown as Material;
        state.materials = state.materials.filter(m => m._id !== material._id);
        if (state.selectedMaterial?._id === material._id) {
          state.selectedMaterial = null;
        }
      })
      .addCase(deleteMaterial.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Materials by Category
      .addCase(fetchMaterialsByCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMaterialsByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update materials with filtered results
        state.materials = action.payload as unknown as Material[];
      })
      .addCase(fetchMaterialsByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Low Stock Materials
      .addCase(fetchLowStockMaterials.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLowStockMaterials.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lowStockMaterials = action.payload as unknown as Material[];
      })
      .addCase(fetchLowStockMaterials.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedMaterial,
  updateFilters,
  clearFilters,
  setLowStockThreshold,
  clearError,
  filterMaterials,
} = materialSlice.actions;

export default materialSlice.reducer;

// Selectors
export const selectMaterials = (state: { materials: MaterialState }) => state.materials.materials;
export const selectSelectedMaterial = (state: { materials: MaterialState }) => state.materials.selectedMaterial;
export const selectMaterialsLoading = (state: { materials: MaterialState }) => state.materials.isLoading;
export const selectMaterialsError = (state: { materials: MaterialState }) => state.materials.error;
export const selectMaterialsFilters = (state: { materials: MaterialState }) => state.materials.filters;
export const selectLowStockMaterials = (state: { materials: MaterialState }) => state.materials.lowStockMaterials;
export const selectLowStockThreshold = (state: { materials: MaterialState }) => state.materials.lowStockThreshold;

// Computed selectors
export const selectFilteredMaterials = (state: { materials: MaterialState }) => {
  const { materials, filters } = state.materials;
  
  return materials.filter(material => {
    const matchesCategory = !filters.category || material.category === filters.category;
    const matchesSupplier = !filters.supplier || material.supplier === filters.supplier;
    const matchesSearch = !filters.searchTerm || 
      matchesSearchTerm(material.name, filters.searchTerm) ||
      (material.description && matchesSearchTerm(material.description, filters.searchTerm));
    const matchesLowStock = !filters.lowStockOnly || material.quantity <= state.materials.lowStockThreshold;
    
    return matchesCategory && matchesSupplier && matchesSearch && matchesLowStock;
  });
};

export const selectMaterialsByCategory = (state: { materials: MaterialState }) => {
  const materials = selectFilteredMaterials(state);
  const categories = [...new Set(materials.map(m => m.category))];
  
  return categories.map(category => ({
    category,
    materials: materials.filter(m => m.category === category),
    count: materials.filter(m => m.category === category).length
  }));
};

export const selectMaterialsStats = (state: { materials: MaterialState }) => {
  const materials = state.materials.materials;
  const lowStockMaterials = state.materials.lowStockMaterials;
  
  return {
    total: materials.length,
    lowStock: lowStockMaterials.length,
    categories: [...new Set(materials.map(m => m.category))].length,
    totalValue: materials.reduce((sum, m) => sum + (m.price * m.quantity), 0),
    averagePrice: materials.length > 0 ? materials.reduce((sum, m) => sum + m.price, 0) / materials.length : 0,
  };
};
