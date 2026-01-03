import { supabase } from './supabaseClient';

// ============================================
// USUÁRIO
// ============================================
export const getUserById = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// LOOT SYSTEM - SEGURO (executado no servidor)
// ============================================
export const generateLoot = async (userId) => {
  try {
    const { data, error } = await supabase.rpc('generate_loot', {
      p_user_id: userId
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao gerar loot:', error);
    throw error;
  }
};

// ============================================
// INVENTÁRIO - SKILLS
// ============================================
export const getUserSkills = async (userId) => {
  const { data, error } = await supabase
    .from('user_skills')
    .select(`
      *,
      skill:skills(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getEquippedSkills = async (userId) => {
  const { data, error } = await supabase
    .from('user_skills')
    .select(`
      *,
      skill:skills(*)
    `)
    .eq('user_id', userId)
    .not('slot', 'is', null)
    .order('slot', { ascending: true });

  if (error) throw error;
  return data;
};

export const toggleSkillEquipped = async (userId, skillId, slot = null) => {
  const { data, error } = await supabase.rpc('equip_skill_to_slot', {
    p_user_id: userId,
    p_skill_id: skillId,
    p_slot: slot
  });

  if (error) throw error;
  return data;
};

export const convertSkillToXP = async (userId, skillId, quantidade = 1) => {
  const { data, error } = await supabase.rpc('convert_skill_to_xp', {
    p_user_id: userId,
    p_skill_id: skillId,
    p_quantidade: quantidade
  });

  if (error) throw error;
  return data;
};

// ============================================
// INVENTÁRIO - XP ITEMS
// ============================================
export const getUserXPItems = async (userId) => {
  const { data, error } = await supabase
    .from('user_xp_items')
    .select(`
      *,
      item:xp_item_definitions(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const useXPItem = async (userId, itemId, quantidade = 1) => {
  const { data, error } = await supabase.rpc('use_xp_item', {
    p_user_id: userId,
    p_item_id: itemId,
    p_quantidade: quantidade
  });

  if (error) throw error;
  return data;
};

// ============================================
// SISTEMA DE BUILDS
// ============================================
export const getUserBuilds = async (userId) => {
  const { data, error } = await supabase
    .from('user_builds')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const saveCurrentBuild = async (userId, nome) => {
  const { data, error } = await supabase.rpc('save_current_build', {
    p_user_id: userId,
    p_nome: nome
  });

  if (error) throw error;
  return data;
};

export const loadBuild = async (userId, buildId) => {
  const { data, error } = await supabase.rpc('load_build', {
    p_user_id: userId,
    p_build_id: buildId
  });

  if (error) throw error;
  return data;
};

export const updateBuild = async (userId, buildId, nome) => {
  const { data, error } = await supabase.rpc('update_build', {
    p_user_id: userId,
    p_build_id: buildId,
    p_nome: nome
  });

  if (error) throw error;
  return data;
};

export const deleteBuild = async (userId, buildId) => {
  const { data, error } = await supabase.rpc('delete_build', {
    p_user_id: userId,
    p_build_id: buildId
  });

  if (error) throw error;
  return data;
};

export const getBuildDetails = async (buildId) => {
  const { data, error } = await supabase
    .from('user_builds')
    .select(`
      *,
      slot_1_skill:slot_1(id, name, image),
      slot_2_skill:slot_2(id, name, image),
      slot_3_skill:slot_3(id, name, image),
      slot_4_skill:slot_4(id, name, image),
      slot_5_skill:slot_5(id, name, image),
      slot_6_skill:slot_6(id, name, image)
    `)
    .eq('id', buildId)
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// MARKETPLACE
// ============================================
export const listItemOnMarketplace = async (userId, itemType, itemId, quantidade, preco) => {
  const { data, error } = await supabase.rpc('list_item_on_marketplace', {
    p_user_id: userId,
    p_item_type: itemType,
    p_item_id: itemId,
    p_quantidade: quantidade,
    p_preco: preco
  });

  if (error) throw error;
  return data;
};

export const getMarketplaceListings = async (itemType = null) => {
  let query = supabase
    .from('marketplace_listings')
    .select(`
      *,
      seller:users!seller_id(id, nome, avatar)
    `)
    .eq('status', 'ativa')
    .order('created_at', { ascending: false });

  if (itemType) {
    query = query.eq('item_type', itemType);
  }

  const { data, error } = await query;
  if (error) throw error;

  const listingsWithDetails = await Promise.all(
    data.map(async (listing) => {
      if (listing.item_type === 'skill') {
        const { data: skill } = await supabase
          .from('skills')
          .select('*')
          .eq('id', listing.item_id)
          .single();
        return { ...listing, item_details: skill };
      } else {
        const { data: xpItem } = await supabase
          .from('xp_item_definitions')
          .select('*')
          .eq('id', listing.item_id)
          .single();
        return { ...listing, item_details: xpItem };
      }
    })
  );

  return listingsWithDetails;
};

export const buyFromMarketplace = async (userId, listingId) => {
  const { data, error } = await supabase.rpc('buy_from_marketplace', {
    p_buyer_id: userId,
    p_listing_id: listingId
  });

  if (error) throw error;
  return data;
};

export const cancelMarketplaceListing = async (userId, listingId) => {
  const { data, error } = await supabase.rpc('cancel_marketplace_listing', {
    p_user_id: userId,
    p_listing_id: listingId
  });

  if (error) throw error;
  return data;
};

export const getUserListings = async (userId) => {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select('*')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const listingsWithDetails = await Promise.all(
    data.map(async (listing) => {
      if (listing.item_type === 'skill') {
        const { data: skill } = await supabase
          .from('skills')
          .select('*')
          .eq('id', listing.item_id)
          .single();

        return { ...listing, item_details: skill };
      } else {
        const { data: xpItem } = await supabase
          .from('xp_item_definitions')
          .select('*')
          .eq('id', listing.item_id)
          .single();

        return { ...listing, item_details: xpItem };
      }
    })
  );

  return listingsWithDetails;
};


// ============================================
// TRANSAÇÕES
// ============================================
export const getUserTransactions = async (userId, limit = 50) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};

// ============================================
// SISTEMA DE BATALHA
// ============================================
export const iniciarBatalha = async (userId, oponenteId) => {
  try {
    const response = await supabase.functions.invoke('battle-simulate', {
      body: { user_id: userId, oponente_id: oponenteId }
    });

    if (response.error) throw response.error;
    return response.data;
  } catch (error) {
    console.error('Erro ao iniciar batalha:', error);
    throw error;
  }
};

export const getBatalhasUsuario = async (userId, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('batalhas')
      .select(`
        id,
        created_at,
        vencedor_id,
        user:user_id(id, username, nivel),
        oponente:oponente_id(id, username, nivel)
      `)
      .or(`user_id.eq.${userId},oponente_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar batalhas:', error);
    throw error;
  }
};

export const getBatalhaDetalhes = async (batalhaId) => {
  try {
    const { data, error } = await supabase
      .from('batalhas')
      .select(`
        *,
        user:user_id(id, username, nivel),
        oponente:oponente_id(id, username, nivel)
      `)
      .eq('id', batalhaId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar detalhes da batalha:', error);
    throw error;
  }
};

export const getRanking = async (limit = 50) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, nome, nivel')
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }

    if (!users || users.length === 0) {
      return [];
    }

    const usersComVitorias = await Promise.all(
      users.map(async (user) => {
        const { count } = await supabase
          .from('batalhas')
          .select('id', { count: 'exact', head: true })
          .eq('vencedor_id', user.id);

        return { 
          ...user, 
          vitorias: count || 0,
          username: user.nome || 'Sem nome'
        };
      })
    );

    return usersComVitorias.sort((a, b) => {
      if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
      return (b.nivel || 1) - (a.nivel || 1);
    });
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    throw error;
  }
};

export const getSkillsEquipadas = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_skills')
      .select(`
        slot,
        skill:skill_id(*)
      `)
      .eq('user_id', userId)
      .not('slot', 'is', null)
      .order('slot');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar skills equipadas:', error);
    throw error;
  }
};

export default {
  getUserById,
  updateUserProfile,
  generateLoot,
  getUserSkills,
  getEquippedSkills,
  toggleSkillEquipped,
  convertSkillToXP,
  getUserXPItems,
  useXPItem,
  getUserBuilds,
  saveCurrentBuild,
  loadBuild,
  updateBuild,
  deleteBuild,
  getBuildDetails,
  listItemOnMarketplace,
  getMarketplaceListings,
  buyFromMarketplace,
  cancelMarketplaceListing,
  getUserListings,
  getUserTransactions,
  iniciarBatalha,
  getBatalhasUsuario,
  getBatalhaDetalhes,
  getRanking,
  getSkillsEquipadas
};