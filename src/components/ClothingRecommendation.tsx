import type { Recommendation } from '../types';

interface ClothingRecommendationProps {
  recommendation: Recommendation;
}

const layerIcons: Record<string, string> = {
  base: '👕',
  mid: '🧥',
  outer: '🧥',
};

const layerNames: Record<string, string> = {
  base: 'Base Layer',
  mid: 'Mid Layer',
  outer: 'Outer Layer',
};

export function ClothingRecommendation({ recommendation }: ClothingRecommendationProps) {
  return (
    <div className="w-full space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">What to Wear</h2>
      
      {/* Clothing Layers */}
      <div className="space-y-2">
        {recommendation.layers.map((layer, index) => (
          <div
            key={`${layer.type}-${index}`}
            className="bg-white rounded-xl p-4 shadow flex items-start gap-3"
          >
            <span className="text-2xl">{layerIcons[layer.type]}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {layerNames[layer.type]}
                </span>
              </div>
              <p className="font-medium text-slate-800 mt-1">{layer.item}</p>
              <p className="text-sm text-slate-500">{layer.reason}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Accessories */}
      {recommendation.accessories.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🎒</span>
            <h3 className="font-medium text-slate-800">Accessories</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendation.accessories.map((accessory, index) => (
              <span
                key={index}
                className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm"
              >
                {accessory}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {recommendation.tips.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💡</span>
            <h3 className="font-medium text-amber-800">Tips</h3>
          </div>
          <ul className="space-y-1">
            {recommendation.tips.map((tip, index) => (
              <li key={index} className="text-sm text-amber-700">
                • {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
