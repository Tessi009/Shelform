import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { email, password, businessName, fullName } = await request.json();

    if (!email || !password || !businessName || !fullName) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // 1. Create business
    const { data: business, error: bizError } = await supabaseAdmin
      .from("businesses")
      .insert({
        name: businessName,
        slug:
          businessName.toLowerCase().replace(/\s+/g, "-") +
          "-" +
          crypto.randomUUID().slice(0, 8),
      })
      .select()
      .single();

    if (bizError) {
      return NextResponse.json({ error: bizError.message }, { status: 500 });
    }

    // 2. Create auth user (trigger creates profile with business_id from metadata)
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          business_id: business.id,
          full_name: fullName,
        },
      });

    if (authError) {
      await supabaseAdmin.from("businesses").delete().eq("id", business.id);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // 3. Create default warehouse
    const { error: whError } = await supabaseAdmin
      .from("warehouses")
      .insert({
        business_id: business.id,
        name: "Main Warehouse",
        location: "Default",
      });

    if (whError) {
      await supabaseAdmin
        .from("businesses")
        .delete()
        .eq("id", business.id);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: whError.message }, { status: 500 });
    }

    return NextResponse.json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      business: {
        id: business.id,
        name: business.name,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
