import { Asset } from "@/types/asset";
import { Copy, Edit, Trash2, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AssetCardProps {
  asset: Asset;
  viewMode: "grid" | "list";
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
}

function copyText(text: string, label: string) {
  navigator.clipboard.writeText(text);
  toast({ title: "Copied!", description: `${label} copied to clipboard.` });
}

function ColorCard({ asset, onEdit, onDelete }: { asset: Asset; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="group rounded-xl border bg-card overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] duration-200">
      <div className="flex h-20">
        {asset.hexValues.map((hex, i) => (
          <button
            key={i}
            className="flex-1 relative group/swatch"
            style={{ backgroundColor: hex }}
            onClick={() => copyText(hex, hex)}
            title={`Copy ${hex}`}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/swatch:opacity-100 transition-opacity bg-black/20">
              <Copy className="h-4 w-4 text-white drop-shadow" />
            </div>
          </button>
        ))}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-sm">{asset.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{asset.project}</p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="p-1 rounded hover:bg-muted"><Edit className="h-3.5 w-3.5" /></button>
            <button onClick={onDelete} className="p-1 rounded hover:bg-destructive/20 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        </div>
        {asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {asset.tags.map(t => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FontCard({ asset, onEdit, onDelete }: { asset: Asset; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="group rounded-xl border bg-card p-4 transition-all hover:shadow-lg hover:scale-[1.02] duration-200">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-sm">{asset.name}</h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1 rounded hover:bg-muted"><Edit className="h-3.5 w-3.5" /></button>
          <button onClick={onDelete} className="p-1 rounded hover:bg-destructive/20 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      <p className="text-xl mb-2" style={{ fontFamily: asset.fontFamily }}>
        The quick brown fox
      </p>
      <div className="flex flex-wrap gap-1">
        {asset.fontWeights.map(w => (
          <span key={w} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{w}</span>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2">{asset.project}</p>
    </div>
  );
}

function IconCard({ asset, onEdit, onDelete }: { asset: Asset; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="group rounded-xl border bg-card p-4 transition-all hover:shadow-lg hover:scale-[1.02] duration-200">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-sm">{asset.name}</h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => copyText(asset.iconSvg, "SVG")} className="p-1 rounded hover:bg-muted"><Copy className="h-3.5 w-3.5" /></button>
          <button onClick={onEdit} className="p-1 rounded hover:bg-muted"><Edit className="h-3.5 w-3.5" /></button>
          <button onClick={onDelete} className="p-1 rounded hover:bg-destructive/20 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      </div>
      <div
        className="h-24 flex items-center justify-center text-foreground [&_svg]:w-12 [&_svg]:h-12"
        dangerouslySetInnerHTML={{ __html: asset.iconSvg }}
      />
      <div className="flex flex-wrap gap-1 mt-2">
        {asset.tags.map(t => (
          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-1">{asset.project}</p>
    </div>
  );
}

function ImageCard({ asset, onEdit, onDelete }: { asset: Asset; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="group rounded-xl border bg-card overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] duration-200">
      <div className="relative h-40">
        <img src={asset.imageUrl} alt={asset.name} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white text-sm font-medium">{asset.name}</span>
          <div className="flex gap-1">
            <a href={asset.imageUrl} target="_blank" rel="noopener noreferrer" className="p-1 rounded bg-white/20 hover:bg-white/30">
              <ExternalLink className="h-3.5 w-3.5 text-white" />
            </a>
            <button onClick={onEdit} className="p-1 rounded bg-white/20 hover:bg-white/30"><Edit className="h-3.5 w-3.5 text-white" /></button>
            <button onClick={onDelete} className="p-1 rounded bg-white/20 hover:bg-white/30"><Trash2 className="h-3.5 w-3.5 text-white" /></button>
          </div>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm">{asset.name}</h3>
        <p className="text-xs text-muted-foreground">{asset.project}</p>
        {asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {asset.tags.map(t => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ListRow({ asset, onEdit, onDelete }: { asset: Asset; onEdit: () => void; onDelete: () => void }) {
  const typeIcons: Record<string, string> = { color: "🎨", font: "🔤", icon: "⬡", image: "🖼" };
  return (
    <div className="group flex items-center gap-4 px-4 py-3 border-b hover:bg-muted/50 transition-colors">
      <span className="text-lg">{typeIcons[asset.type]}</span>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm truncate">{asset.name}</h3>
        <p className="text-xs text-muted-foreground">{asset.project}</p>
      </div>
      <div className="flex flex-wrap gap-1 max-w-[200px]">
        {asset.tags.slice(0, 3).map(t => (
          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
        ))}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-1.5 rounded hover:bg-muted"><Edit className="h-4 w-4" /></button>
        <button onClick={onDelete} className="p-1.5 rounded hover:bg-destructive/20 text-destructive"><Trash2 className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

export function AssetCard({ asset, viewMode, onEdit, onDelete }: AssetCardProps) {
  const edit = () => onEdit(asset);
  const del = () => onDelete(asset);

  if (viewMode === "list") return <ListRow asset={asset} onEdit={edit} onDelete={del} />;

  switch (asset.type) {
    case "color": return <ColorCard asset={asset} onEdit={edit} onDelete={del} />;
    case "font": return <FontCard asset={asset} onEdit={edit} onDelete={del} />;
    case "icon": return <IconCard asset={asset} onEdit={edit} onDelete={del} />;
    case "image": return <ImageCard asset={asset} onEdit={edit} onDelete={del} />;
  }
}
