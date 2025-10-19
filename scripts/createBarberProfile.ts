import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBarberProfile() {
  const email = 'kanikashreesivakumar16@gmail.com';
  
  console.log('🔍 Looking for profile with email:', email);
  
  // First, find the profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .maybeSingle();
  
  if (profileError) {
    console.error('❌ Error finding profile:', profileError);
    return;
  }
  
  if (!profile) {
    console.error('❌ No profile found for this email. Please sign up first.');
    return;
  }
  
  console.log('✅ Profile found:', profile);
  
  // Update profile role to barber if needed
  if (profile.role !== 'barber') {
    console.log('📝 Updating profile role to barber...');
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'barber' })
      .eq('id', profile.id);
    
    if (updateError) {
      console.error('❌ Error updating profile:', updateError);
    } else {
      console.log('✅ Profile role updated to barber');
    }
  }
  
  // Check if barber record exists
  const { data: existingBarber, error: barberCheckError } = await supabase
    .from('barbers')
    .select('*')
    .eq('user_id', profile.id)
    .maybeSingle();
  
  if (barberCheckError && barberCheckError.code !== 'PGRST116') {
    console.error('❌ Error checking for existing barber:', barberCheckError);
    return;
  }
  
  if (existingBarber) {
    console.log('✅ Barber record already exists:', existingBarber);
    
    // Update email if missing
    if (!existingBarber.email) {
      const { error: emailUpdateError } = await supabase
        .from('barbers')
        .update({ email: email })
        .eq('id', existingBarber.id);
      
      if (emailUpdateError) {
        console.error('❌ Error updating barber email:', emailUpdateError);
      } else {
        console.log('✅ Barber email updated');
      }
    }
    
    return;
  }
  
  // Create barber record
  console.log('📝 Creating barber record...');
  const { data: newBarber, error: createError } = await supabase
    .from('barbers')
    .insert({
      user_id: profile.id,
      email: email,
      specialization: 'General Haircuts',
      experience_years: 1,
      bio: 'Professional barber providing quality haircuts and grooming services',
      rating: 5.0,
      total_reviews: 0,
      is_available: true
    })
    .select();
  
  if (createError) {
    console.error('❌ Error creating barber:', createError);
    console.error('Details:', createError.message, createError.details);
  } else {
    console.log('✅ Barber record created successfully:', newBarber);
  }
}

createBarberProfile()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
