
export const toolboxConfig = {
  kind: 'categoryToolbox',
  contents: [
    // ========== HTML SECTION ==========
    {
      kind: 'sep'
    },
    {
      kind: 'category',
      name: 'HTML',
      colour: '#f16529',
      cssconfig: {
        row: 'htmlCategory'
      },
      contents:[
        {
          kind: 'toolboxlabel',
          name: 'HTML',
          colour: '#000000',
          cssconfig: {
            label: 'customLabel'
          }
        },
        {
          kind: 'category',
          name: 'Document',
          colour: '#5C81A6',
          contents: [
            { kind: 'block', type: 'html_boilerplate' }
          ]
        },
        {
          kind: 'category',
          name: 'Head Elements',
          colour: '#8B5CF6',
          contents: [
            { kind: 'block', type: 'html_title' },
            { kind: 'block', type: 'html_meta' },
            { kind: 'block', type: 'html_link' },
            { kind: 'block', type: 'html_style' }
          ]
        },
        {
          kind: 'category',
          name: 'Layout',
          colour: '#10B981',
          contents: [
            { kind: 'block', type: 'html_div' },
            { kind: 'block', type: 'html_section' },
            { kind: 'block', type: 'html_header' },
            { kind: 'block', type: 'html_footer' },
            { kind: 'block', type: 'html_nav' },
            { kind: 'block', type: 'html_main' }
          ]
        },
        {
          kind: 'category',
          name: 'Text',
          colour: '#F59E0B',
          contents: [
            { kind: 'block', type: 'html_heading' },
            { kind: 'block', type: 'html_paragraph' },
            { kind: 'block', type: 'html_text' },
            { kind: 'block', type: 'html_span' }
          ]
        },
        {
          kind: 'category',
          name: 'Media',
          colour: '#EC4899',
          contents: [
            { kind: 'block', type: 'html_image' },
            { kind: 'block', type: 'html_video' }
          ]
        },
        {
          kind: 'category',
          name: 'Interactive',
          colour: '#3B82F6',
          contents: [
            { kind: 'block', type: 'html_link_element' },
            { kind: 'block', type: 'html_button' },
            { kind: 'block', type: 'html_input' }
          ]
        },
        {
          kind: 'category',
          name: 'Lists',
          colour: '#6366F1',
          contents: [
            { kind: 'block', type: 'html_list' },
            { kind: 'block', type: 'html_list_item' }
          ]
        },
      ]
    },
    // ========== CSS SECTION ==========
    {
      kind: 'sep'
    },
    {
      kind: 'category',
      name: 'CSS',
      colour: '#29a8e0',
      cssconfig: {
        row: 'cssCategory'
      },
      contents: [
        {
          kind: 'toolboxlabel',
          name: 'CSS',
          colour: '#000000',
          cssconfig: {
            label: 'customLabel',
          }
        },
        {
          kind: 'category',
          name: 'CSS Rules',
          colour: '#E11D48',
          contents: [
            { kind: 'block', type: 'css_rule' }
          ]
        },
        {
          kind: 'category',
          name: 'Typography',
          colour: '#FB7185',
          contents: [
            { kind: 'block', type: 'css_color' },
            { kind: 'block', type: 'css_background' },
            { kind: 'block', type: 'css_font_size' },
            { kind: 'block', type: 'css_font_family' },
            { kind: 'block', type: 'css_text_align' }
          ]
        },
        {
          kind: 'category',
          name: 'Box Model',
          colour: '#A855F7',
          contents: [
            { kind: 'block', type: 'css_margin' },
            { kind: 'block', type: 'css_padding' },
            { kind: 'block', type: 'css_border' },
            { kind: 'block', type: 'css_border_radius' },
            { kind: 'block', type: 'css_width' },
            { kind: 'block', type: 'css_height' }
          ]
        },
        {
          kind: 'category',
          name: 'Layout',
          colour: '#14B8A6',
          contents: [
            { kind: 'block', type: 'css_display' },
            { kind: 'block', type: 'css_flexbox' },
            { kind: 'block', type: 'css_position' }
          ]
        },
        {
          kind: 'category',
          name: 'Custom',
          colour: '#64748B',
          contents: [
            { kind: 'block', type: 'css_custom' }
          ]
        },
      ]
    },
    {
      kind: 'sep'
    }
  ]
};