// src/lib/services/admin.service.js
import { supabaseAdmin, logAdminAction } from '@/lib/supabase-server';

// =====================================================
// DASHBOARD STATS
// =====================================================
export const adminStats = {
  // Get overview statistics
  getOverview: async () => {
    try {
      // Total vendors
      const { count: totalVendors } = await supabaseAdmin
        .from('vendors')
        .select('*', { count: 'exact', head: true });

      // Pending vendors
      const { count: pendingVendors } = await supabaseAdmin
        .from('vendors')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Total products
      const { count: totalProducts } = await supabaseAdmin
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Total orders
      const { count: totalOrders } = await supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Total revenue (sum of all delivered orders)
      const { data: revenueData } = await supabaseAdmin
        .from('orders')
        .select('total')
        .eq('status', 'delivered');

      const totalRevenue = revenueData?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0;

      // Pending orders
      const { count: pendingOrders } = await supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'confirmed', 'processing']);

      // Active products
      const { count: activeProducts } = await supabaseAdmin
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      return {
        data: {
          totalVendors,
          pendingVendors,
          totalProducts,
          activeProducts,
          totalOrders,
          pendingOrders,
          totalRevenue,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Get recent activity
  getRecentActivity: async (limit = 20) => {
    const { data, error } = await supabaseAdmin
      .from('admin_logs')
      .select(`
        *,
        admin:profiles(full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  },

  // Get sales chart data (last 30 days)
  getSalesChartData: async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('created_at, total, status')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at');

    if (error) return { data: null, error };

    // Group by date
    const salesByDate = {};
    data.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString();
      if (!salesByDate[date]) {
        salesByDate[date] = { date, revenue: 0, orders: 0 };
      }
      salesByDate[date].revenue += parseFloat(order.total);
      salesByDate[date].orders += 1;
    });

    return { data: Object.values(salesByDate), error: null };
  },
};

// =====================================================
// VENDOR MANAGEMENT
// =====================================================
export const adminVendors = {
  // Get all vendors with filters
  getAll: async (filters = {}) => {
    let query = supabaseAdmin
      .from('vendors')
      .select(`
        *,
        user:profiles(id, email, full_name)
      `);

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.search) {
      query = query.or(
        `business_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
      );
    }

    // Sorting
    const sortField = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder === 'asc' ? { ascending: true } : { ascending: false };
    query = query.order(sortField, sortOrder);

    // Pagination
    if (filters.page && filters.pageSize) {
      const from = (filters.page - 1) * filters.pageSize;
      const to = from + filters.pageSize - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    return { data, error, count };
  },

  // Get vendor by ID
  getById: async (vendorId) => {
    const { data, error } = await supabaseAdmin
      .from('vendors')
      .select(`
        *,
        user:profiles(id, email, full_name, phone),
        products(id, name, status, price, stock_quantity)
      `)
      .eq('id', vendorId)
      .single();

    return { data, error };
  },

  // Approve vendor
  approve: async (vendorId, adminId, request) => {
    // Get current vendor data for logging
    const { data: oldVendor } = await supabaseAdmin
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single();

    const { data, error } = await supabaseAdmin
      .from('vendors')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: adminId,
        rejection_reason: null,
      })
      .eq('id', vendorId)
      .select()
      .single();

    if (!error) {
      await logAdminAction(
        adminId,
        'approve_vendor',
        'vendor',
        vendorId,
        oldVendor,
        data,
        request
      );
    }

    return { data, error };
  },

  // Reject vendor
  reject: async (vendorId, reason, adminId, request) => {
    const { data: oldVendor } = await supabaseAdmin
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single();

    const { data, error } = await supabaseAdmin
      .from('vendors')
      .update({
        status: 'rejected',
        rejection_reason: reason,
      })
      .eq('id', vendorId)
      .select()
      .single();

    if (!error) {
      await logAdminAction(
        adminId,
        'reject_vendor',
        'vendor',
        vendorId,
        oldVendor,
        data,
        request
      );
    }

    return { data, error };
  },

  // Suspend vendor
  suspend: async (vendorId, reason, adminId, request) => {
    const { data: oldVendor } = await supabaseAdmin
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single();

    const { data, error } = await supabaseAdmin
      .from('vendors')
      .update({
        status: 'suspended',
        rejection_reason: reason,
      })
      .eq('id', vendorId)
      .select()
      .single();

    if (!error) {
      await logAdminAction(
        adminId,
        'suspend_vendor',
        'vendor',
        vendorId,
        oldVendor,
        data,
        request
      );
    }

    return { data, error };
  },

  // Reactivate vendor
  reactivate: async (vendorId, adminId, request) => {
    const { data: oldVendor } = await supabaseAdmin
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single();

    const { data, error } = await supabaseAdmin
      .from('vendors')
      .update({
        status: 'approved',
        rejection_reason: null,
      })
      .eq('id', vendorId)
      .select()
      .single();

    if (!error) {
      await logAdminAction(
        adminId,
        'reactivate_vendor',
        'vendor',
        vendorId,
        oldVendor,
        data,
        request
      );
    }

    return { data, error };
  },

  // Update vendor details
  update: async (vendorId, updates, adminId, request) => {
    const { data: oldVendor } = await supabaseAdmin
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single();

    const { data, error } = await supabaseAdmin
      .from('vendors')
      .update(updates)
      .eq('id', vendorId)
      .select()
      .single();

    if (!error) {
      await logAdminAction(
        adminId,
        'update_vendor',
        'vendor',
        vendorId,
        oldVendor,
        data,
        request
      );
    }

    return { data, error };
  },

  // Delete vendor (soft delete by suspending)
  delete: async (vendorId, adminId, request) => {
    const { data: oldVendor } = await supabaseAdmin
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single();

    const { data, error } = await supabaseAdmin
      .from('vendors')
      .update({
        status: 'suspended',
        rejection_reason: 'Deleted by admin',
      })
      .eq('id', vendorId)
      .select()
      .single();

    if (!error) {
      await logAdminAction(
        adminId,
        'delete_vendor',
        'vendor',
        vendorId,
        oldVendor,
        null,
        request
      );
    }

    return { data, error };
  },
};

// =====================================================
// PRODUCT MANAGEMENT
// =====================================================
export const adminProducts = {
  // Get all products with filters
  getAll: async (filters = {}) => {
    let query = supabaseAdmin
      .from('products')
      .select(`
        *,
        vendor:vendors(id, business_name, status),
        category:categories(id, name)
      `);

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.vendorId) {
      query = query.eq('vendor_id', filters.vendorId);
    }

    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`
      );
    }

    // Sorting
    const sortField = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder === 'asc' ? { ascending: true } : { ascending: false };
    query = query.order(sortField, sortOrder);

    // Pagination
    if (filters.page && filters.pageSize) {
      const from = (filters.page - 1) * filters.pageSize;
      const to = from + filters.pageSize - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    return { data, error, count };
  },

  // Get product by ID
  getById: async (productId) => {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        vendor:vendors(id, business_name, email, phone),
        category:categories(id, name, slug),
        reviews(id, rating, comment, customer:profiles(full_name))
      `)
      .eq('id', productId)
      .single();

    return { data, error };
  },

  // Update product status
  updateStatus: async (productId, status, adminId, request) => {
    const { data: oldProduct } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ status })
      .eq('id', productId)
      .select()
      .single();

    if (!error) {
      await logAdminAction(
        adminId,
        `product_status_${status}`,
        'product',
        productId,
        oldProduct,
        data,
        request
      );
    }

    return { data, error };
  },

  // Update product
  update: async (productId, updates, adminId, request) => {
    const { data: oldProduct } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();

    if (!error) {
      await logAdminAction(
        adminId,
        'update_product',
        'product',
        productId,
        oldProduct,
        data,
        request
      );
    }

    return { data, error };
  },

  // Delete product
  delete: async (productId, adminId, request) => {
    const { data: oldProduct } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productId);

    if (!error) {
      await logAdminAction(
        adminId,
        'delete_product',
        'product',
        productId,
        oldProduct,
        null,
        request
      );
    }

    return { error };
  },

  // Toggle featured status
  toggleFeatured: async (productId, isFeatured, adminId, request) => {
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ is_featured: isFeatured })
      .eq('id', productId)
      .select()
      .single();

    if (!error) {
      await logAdminAction(
        adminId,
        `product_featured_${isFeatured}`,
        'product',
        productId,
        null,
        data,
        request
      );
    }

    return { data, error };
  },
};

// =====================================================
// ORDER MANAGEMENT
// =====================================================
export const adminOrders = {
  // Get all orders with filters
  getAll: async (filters = {}) => {
    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        customer:profiles(id, full_name, email),
        items:order_items(
          *,
          product:products(name, images),
          vendor:vendors(business_name)
        )
      `);

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.paymentStatus) {
      query = query.eq('payment_status', filters.paymentStatus);
    }

    if (filters.search) {
      query = query.or(
        `order_number.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`
      );
    }

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    // Sorting
    const sortField = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder === 'asc' ? { ascending: true } : { ascending: false };
    query = query.order(sortField, sortOrder);

    // Pagination
    if (filters.page && filters.pageSize) {
      const from = (filters.page - 1) * filters.pageSize;
      const to = from + filters.pageSize - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    return { data, error, count };
  },

  // Get order by ID
  getById: async (orderId) => {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        customer:profiles(id, full_name, email, phone),
        items:order_items(
          *,
          product:products(name, images, sku),
          vendor:vendors(business_name, email, phone)
        )
      `)
      .eq('id', orderId)
      .single();

    return { data, error };
  },

  // Update order status
  updateStatus: async (orderId, status, adminId, request) => {
    const { data: oldOrder } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    const updates = { status };

    // Set appropriate timestamp
    if (status === 'confirmed') updates.confirmed_at = new Date().toISOString();
    if (status === 'shipped') updates.shipped_at = new Date().toISOString();
    if (status === 'delivered') updates.delivered_at = new Date().toISOString();
    if (status === 'cancelled') updates.cancelled_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (!error) {
      await logAdminAction(
        adminId,
        `order_status_${status}`,
        'order',
        orderId,
        oldOrder,
        data,
        request
      );
    }

    return { data, error };
  },

  // Update payment status
  updatePaymentStatus: async (orderId, paymentStatus, adminId, request) => {
    const { data: oldOrder } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ payment_status: paymentStatus })
      .eq('id', orderId)
      .select()
      .single();

    if (!error) {
      await logAdminAction(
        adminId,
        `order_payment_${paymentStatus}`,
        'order',
        orderId,
        oldOrder,
        data,
        request
      );
    }

    return { data, error };
  },

  // Add admin note
  addNote: async (orderId, note, adminId, request) => {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ admin_notes: note })
      .eq('id', orderId)
      .select()
      .single();

    if (!error) {
      await logAdminAction(
        adminId,
        'order_add_note',
        'order',
        orderId,
        null,
        { note },
        request
      );
    }

    return { data, error };
  },

  // Update tracking info
  updateTracking: async (orderId, trackingNumber, shippingCarrier, adminId, request) => {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({
        tracking_number: trackingNumber,
        shipping_carrier: shippingCarrier,
      })
      .eq('id', orderId)
      .select()
      .single();

    if (!error) {
      await logAdminAction(
        adminId,
        'order_update_tracking',
        'order',
        orderId,
        null,
        { trackingNumber, shippingCarrier },
        request
      );
    }

    return { data, error };
  },
};

// =====================================================
// CATEGORY MANAGEMENT
// =====================================================
export const adminCategories = {
  // Get all categories
  getAll: async () => {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('display_order');

    return { data, error };
  },

  // Create category
  create: async (categoryData, adminId, request) => {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert([categoryData])
      .select()
      .single();

    if (!error) {
      await logAdminAction(
        adminId,
        'create_category',
        'category',
        data.id,
        null,
        data,
        request
      );
    }

    return { data, error };
  },

  // Update category
  update: async (categoryId, updates, adminId, request) => {
    const { data: oldCategory } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
      .single();

    if (!error) {
      await logAdminAction(
        adminId,
        'update_category',
        'category',
        categoryId,
        oldCategory,
        data,
        request
      );
    }

    return { data, error };
  },

  // Delete category
  delete: async (categoryId, adminId, request) => {
    const { data: oldCategory } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (!error) {
      await logAdminAction(
        adminId,
        'delete_category',
        'category',
        categoryId,
        oldCategory,
        null,
        request
      );
    }

    return { error };
  },
};

// =====================================================
// SETTINGS MANAGEMENT
// =====================================================
export const adminSettings = {
  // Get all settings
  getAll: async () => {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('*')
      .order('category');

    return { data, error };
  },

  // Get setting by key
  getByKey: async (key) => {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('*')
      .eq('key', key)
      .single();

    return { data, error };
  },

  // Update setting
  update: async (key, value, adminId, request) => {
    const { data: oldSetting } = await supabaseAdmin
      .from('settings')
      .select('*')
      .eq('key', key)
      .single();

    const { data, error } = await supabaseAdmin
      .from('settings')
      .update({
        value,
        updated_by: adminId,
        updated_at: new Date().toISOString(),
      })
      .eq('key', key)
      .select()
      .single();

    if (!error) {
      await logAdminAction(
        adminId,
        'update_setting',
        'setting',
        key,
        oldSetting,
        data,
        request
      );
    }

    return { data, error };
  },
};